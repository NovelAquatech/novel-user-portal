import React from "react";
import Plot from "react-plotly.js";
import moment from "moment";
import { MultiSelect } from "react-multi-select-component";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useState, useEffect } from "react";
import { APP_CONST } from "../helper/application-constant";
import { useAuth } from "../hooks/useAuth";
import {
  getOrganizedSensorData,
  organizedExportedData,
  capitalizeFirstLetter,
} from "../helper/utils";
import { downloadExcel } from "../helper/download-utils";
import { CirclesWithBar } from "react-loader-spinner";
import { getSensorData } from "../helper/web-service";
export const DetailedAnalytics = React.forwardRef(
  (
    {
      parameters,
      devices,
      selectedDevices,
      selectedHourly,
      selectedParam,
      setSelectedHourly,
      setSelectedParam,
      machines,
    },
    ref
  ) => {
    const { user } = useAuth();
    const farmer_companies = APP_CONST.farmer_companies;
    const orgName = user.orgName;
    const orgIcon = farmer_companies.includes(orgName)
      ? "images/logomain.png"
      : `https://api.cors.lol/?url=${user.orgDetails.icon}`;
    let displayParameters = [];

    Object.keys(parameters).map((parameter, i) => {
      displayParameters.push(parameter);
    });

    if (orgName === "JoeFarm" || orgName === "DeepTesting") {
      displayParameters = displayParameters.filter((param) => {
        const lowerParam = param.toLowerCase();
        if (orgName === "JoeFarm") {
          return lowerParam !== "valve_1" && lowerParam !== "valve_2";
        }
        if (orgName === "DeepTesting") {
          return lowerParam !== "gpio_1" && lowerParam !== "gpio_2";
        }
        return true;
      });
    }
    displayParameters.sort();

    let layout = APP_CONST.default_layout;

    const [organizedSerieData, setOrganizedSerieData] = useState([]);
    const [isLoaderVisible, setLoaderVisible] = useState(false);
    const [sensorData, setSensorData] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [customFrom, setCustomFrom] = useState(
      moment().subtract(1, "days").format("YYYY-MM-DD")
    );
    const [customTo, setCustomTo] = useState(moment().format("YYYY-MM-DD"));
    // Updated function
    const detailedAnalyticsData = () => {
      let pdt = moment().add(-1, "hours");
      let pdtEnd = moment();
      let series = [];

      const timeRanges = {
        last_hour: moment().subtract(1, "hours"),
        last_12_hour: moment().subtract(12, "hours"),
        last_24_hour: moment().subtract(24, "hours"),
        last_48_hour: moment().subtract(48, "hours"),
        last_week: moment().subtract(1, "weeks"),
        last_month: moment().subtract(1, "months"),
        last_year: moment().subtract(1, "years"),
      };

      if (selectedHourly === "custom") {
        pdt = moment(customFrom).startOf("day");
        pdtEnd = moment(customTo).endOf("day");
      } else if (timeRanges[selectedHourly]) {
        pdt = timeRanges[selectedHourly];
        pdtEnd = moment();
      }

      const { seriesData } = getOrganizedSensorData(
        sensorData,
        Object.keys(parameters)
      );
      series = seriesData;

      let sd = [];
      let yAxisCount = 0;
      let paramAxisMap = {}; // 🔑 Track param has for y-axis

      devices.forEach((device) => {
        if (!selectedDevices.includes(device.devEUI)) return;

        let data = series[device.devEUI];
        if (!data) return;

        selectedParam.forEach((pm) => {
          let xArr = [];
          let yArr = [];
          let param = pm["value"];
          let devEUI = null;
          // For Valves__
          if (param.includes("__")) {
            [param, devEUI] = param.split("__");
          }
          if (devEUI && device.devEUI !== devEUI) return;

          data.forEach((s) => {
            let cdt = moment(s.timestamp);
            let yval = s[param] ?? null;
            if (
              cdt.isBetween(pdt, pdtEnd, "seconds", "[]") &&
              yval !== null &&
              yval !== undefined
            ) {
              xArr.push(moment(s.timestamp).format("YYYY-MM-DD H:mm:ss"));
              yArr.push(yval);
            }
          });

          // Only assign axis if this parameter has valid data
          if (xArr.length > 0 && yArr.length > 0) {
            let yaxis;
            let paramKey;

            // Separate rules: For valves - per device; others - shared
            if (param.startsWith("valve_")) {
              paramKey = `${param}__${device.devEUI}`;
            } else {
              paramKey = param;
            }

            if (paramAxisMap[paramKey]) {
              yaxis = paramAxisMap[paramKey];
            } else {
              yAxisCount++;
              yaxis = yAxisCount === 1 ? "y" : `y${yAxisCount}`;
              paramAxisMap[paramKey] = yaxis;

              let prm = parameters[pm.value];
              if (yAxisCount === 1) {
                layout["yaxis"]["title"]["text"] = `${pm.label} (${
                  prm?.unit ?? ""
                })`;
              } else {
                layout[`yaxis${yAxisCount}`] = {
                  title: {
                    text: param.startsWith("valve_")
                      ? `${pm.label} (${prm?.unit ?? ""})`
                      : `${pm.label} (${prm?.unit ?? ""})`,
                    font: { size: 10 },
                  },
                  anchor: "free",
                  side: "left",
                  position: 0.05 * (yAxisCount - 1),
                  overlaying: "y",
                };
              }

              layout["xaxis"]["domain"] = [0.05 * yAxisCount, 1];
            }

            // Handle Power param restriction
            if (parameters[param].paramDisplayName === "Power") {
              if (
                !machines.some(
                  (machine) => machine.primaryDevEUI === device.devEUI
                )
              ) {
                return;
              }
            }

            // Device/machine display name
            let machineName = `${device.devName} - ${parameters[param]?.paramDisplayName}`;
            if (machines && machines.length > 0) {
              const matchedMachine = machines.find(
                (machine) =>
                  machine.devEUIs &&
                  JSON.parse(machine.devEUIs).includes(device.devEUI)
              );
              if (matchedMachine) {
                machineName = `${matchedMachine.PartitionKey} - ${device.devName}: ${parameters[param]?.paramDisplayName}`;
              }
            }

            sd.push({
              x: xArr,
              y: yArr,
              yaxis: yaxis,
              type: "scatter",
              marker: { size: 5 },
              line: { width: 1 },
              name: machineName,
            });
          }
        });
      });

      // ✅ Handle people_present with same shared-axis logic
      let cumulativePeoplePresentdata =
        series[APP_CONST.overAllPeoplePresentDevEUIKey] ?? null;
      let filterParam = selectedParam.filter(
        (param) => param.value === "people_present"
      );

      if (filterParam.length > 0 && cumulativePeoplePresentdata) {
        let xArr = [];
        let yArr = [];
        cumulativePeoplePresentdata.forEach((s) => {
          let cdt = moment(s.timestamp);
          let yval = s[filterParam[0]["value"]] ?? null;
          if (
            cdt.isBetween(pdt, pdtEnd, "seconds", "[]") &&
            yval !== null &&
            yval !== undefined
          ) {
            xArr.push(moment(s.timestamp).format("YYYY-MM-DD H:mm:ss"));
            yArr.push(yval);
          }
        });

        if (xArr.length > 0 && yArr.length > 0) {
          let param = "people_present";
          let yaxis;
          let paramKey = param; // shared axis

          if (paramAxisMap[paramKey]) {
            yaxis = paramAxisMap[paramKey];
          } else {
            yAxisCount++;
            yaxis = yAxisCount === 1 ? "y" : `y${yAxisCount}`;
            paramAxisMap[paramKey] = yaxis;

            layout[`yaxis${yAxisCount}`] = {
              title: {
                text: APP_CONST.overAllPeoplePresentDevNameKey,
                font: { size: 10 },
              },
              anchor: "free",
              side: "left",
              position: 0.05 * (yAxisCount - 1),
              overlaying: "y",
            };
          }

          sd.push({
            x: xArr,
            y: yArr,
            yaxis: yaxis,
            type: "scatter",
            marker: { size: 5 },
            line: { width: 1 },
            name: APP_CONST.overAllPeoplePresentDevNameKey,
          });
        }
      }

      setOrganizedSerieData(sd);
      setDataLoaded(true);
    };

    useEffect(() => {
      detailedAnalyticsData();
    }, [
      sensorData,
      selectedParam,
      selectedDevices,
      customFrom,
      customTo,
      selectedHourly,
    ]);

    const fetchSensorData = async () => {
      setLoaderVisible(true);
      setDataLoaded(false);
      try {
        const sensorDataResp = await getSensorData(
          user,
          selectedHourly,
          customFrom,
          customTo
        );
        const sensorData = sensorDataResp?.["value"];
        if (sensorData) {
          setSensorData(sensorData);
        }
      } catch (error) {
        console.error("Error fetching Sensor data:", error);
      } finally {
        setLoaderVisible(false);
      }
    };
    useEffect(() => {
      if (selectedHourly === "custom") {
        fetchSensorData();
      } else {
        fetchSensorData();
      }
    }, [selectedHourly, customFrom, customTo]);
    const handleHourlyFilterChange = (event) => {
      setSelectedHourly(event.target.value);
    };

    const convertToBase64 = (imgUrl) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = (err) => {
          console.error("Error loading image:", err, "URL:", imgUrl);
          reject(new Error(`Failed to load image from URL: ${imgUrl}`));
        };
        img.src = imgUrl;
      });
    };

    const downloadChartAsPDF = () => {
      return new Promise((resolve, reject) => {
        const chartElement = document.getElementById("chart-container");

        html2canvas(chartElement)
          .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();

            pdf.addImage(imgData, "PNG", 10, 50, 190, 100);

            convertToBase64(orgIcon)
              .then((base64Image) => {
                if (base64Image)
                  pdf.addImage(base64Image, "PNG", 80, 10, 50, 0);
              })
              .catch((error) => {
                console.error(
                  "Error converting image to Base64, skipping icon:",
                  error
                );
              })
              .finally(() => {
                const hiddenDetails = [
                  { text: `Report Name: Detailed-Analysis`, x: 10, y: 20 },
                  { text: `Report Frequency: ${selectedHourly}`, x: 10, y: 30 },
                  {
                    text: `Report Type: ${selectedParam
                      .map((item) => item.label)
                      .join(", ")}`,
                    x: 10,
                    y: 40,
                  },
                ];

                pdf.setFont("helvetica");
                pdf.setFontSize(10);
                hiddenDetails.forEach((detail) => {
                  pdf.text(detail.text, detail.x, detail.y);
                });

                // Trigger the download
                pdf.save(`Detailed-Analysis-Report-${orgName}.pdf`);

                // Resolve the promise after the save call
                resolve();
              });
          })
          .catch((error) => {
            console.error("Error generating PDF:", error);
            reject(error);
          });
      });
    };

    const downloadChartAsExcel = () => {
      return new Promise((resolve, reject) => {
        try {
          const columns = [
            { title: "Date", dataKey: "timestamp" },
            ...displayParameters.map((parameter) => {
              return {
                title: capitalizeFirstLetter(parameter),
                dataKey: parameter,
              };
            }),
          ];
          const filterData = organizedExportedData(
            sensorData,
            selectedHourly,
            parameters,
            selectedDevices
          );
          if (filterData) {
            downloadExcel(filterData, columns, devices, user);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };

    React.useImperativeHandle(ref, () => ({
      downloadChartAsPDF,
      downloadChartAsExcel,
      fetchSensorData,
    }));

    const sortedData = [...organizedSerieData].sort((a, b) => {
      const [deviceA, paramA] = a.name.split(" - ");
      const [deviceB, paramB] = b.name.split(" - ");
      return deviceA.localeCompare(deviceB) || paramA.localeCompare(paramB);
    });

    const updateParamName = (paramDisplayName) => {
      if (paramDisplayName.toLowerCase() == "tvoc")
        return paramDisplayName.toUpperCase();
      if (paramDisplayName.toLowerCase() == "co2") return "CO₂";
      return paramDisplayName;
    };

    const multiSelectOptions = [];
    // Only for DeepTesting org
    if (orgName === "DeepTesting") {
      displayParameters.forEach((parameter) => {
        if (parameter === "valve_1_state" || parameter === "valve_2_state") {
          // Only include valve parameters for selected devices
          devices.forEach((device) => {
            if (selectedDevices.includes(device.devEUI)) {
              multiSelectOptions.push({
                label: `${capitalizeFirstLetter(updateParamName(parameter))} (${
                  device.devName
                })`,
                value: `${parameter}__${device.devEUI}`,
              });
            }
          });
        } else {
          multiSelectOptions.push({
            label: capitalizeFirstLetter(updateParamName(parameter)),
            value: parameter,
          });
        }
      });
    } else {
      displayParameters.forEach((parameter) => {
        multiSelectOptions.push({
          label: capitalizeFirstLetter(updateParamName(parameter)),
          value: parameter,
        });
      });
    }

    return (
      <>
        <div className="row">
          <div className="col-xs-12" style={{ display: "flex" }}>
            <select
              name="hourly_filter"
              value={selectedHourly}
              onChange={handleHourlyFilterChange}
            >
              <option value="last_hour">Last hour</option>
              <option value="last_12_hour">Last 12 hours</option>
              <option value="last_24_hour">Last 24 hours</option>
              <option value="last_48_hour">Last 48 hours</option>
              <option value="last_week">Last Week</option>
              <option value="last_month">Last Month</option>
              <option value="last_year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            {selectedHourly === "custom" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginLeft: "10px",
                }}
              >
                <label>From:</label>
                <input
                  type="date"
                  style={{
                    height: "38px",
                  }}
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <label>To:</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  style={{
                    height: "38px",
                  }}
                />
              </div>
            )}
            <MultiSelect
              options={multiSelectOptions}
              value={selectedParam}
              onChange={setSelectedParam}
              labelledBy="Select"
              hasSelectAll={false}
            />
          </div>
        </div>

        {/* Graph */}
        {isLoaderVisible ? (
          <CirclesWithBar
            color="#00bfff"
            height="70"
            width="70"
            wrapperClass="loader-graph"
            visible={isLoaderVisible}
          />
        ) : !dataLoaded ? null : sortedData.length > 0 ? (
          <div id="chart-container">
            <Plot
              data={sortedData}
              layout={layout}
              config={{
                displayModeBar: false,
              }}
              useResizeHandler={true}
              style={{ width: "100%", marginLeft: "-15px" }}
            />
          </div>
        ) : (
          <div
            style={{
              paddingTop: "50px",
              paddingBottom: "80px",
              height: "410px",
              fontSize: "15px",
            }}
          >
            <b>
              No data available for the selected time range. The devices were
              offline during this period.
              <p>Please choose a different time range to view the data.</p>
            </b>
          </div>
        )}
      </>
    );
  }
);
