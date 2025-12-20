import React, { useRef } from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { CirclesWithBar } from "react-loader-spinner";
import "react-multi-carousel/lib/styles.css";
import { useAuth } from "../hooks/useAuth";
import { useCacheStatus } from "../hooks/useCacheStatus";
import { APP_CONST } from "../helper/application-constant";
import {
  getDevices,  
  getAdvisorySettings,
  getAlerts,
  getAverage,
} from "../helper/web-service";
import { AvgParameters } from "../components/avg_parameters";
import { DeviceList } from "../components/deviceList";
import { AlertAdvisories } from "../components/alert_advisories";
import { DetailedAnalytics } from "../components/detailed_analytics";
import {
  getOrganizedParameters,  
} from "../helper/utils";
import RainFallBarGraph from "../components/RainFallBarGraph";
import { FaDownload } from "react-icons/fa";

export default function DeviceReportPage() {
  const { user } = useAuth();
  const {
    isDevicesFetched,
    setIsDevicesFetched,
    fetchedDevices,
    setFetchedDevices,
  } = useCacheStatus();
  const orgName = user.orgName;
  const [isLoaderVisible, setLoaderVisible] = useState(true);
  const [parameters, setParameters] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedHourly, setSelectedHourly] = useState("last_hour");
  const [selectedParam, setSelectedParam] = useState([]);
  const [avgData, setAvgData] = useState([]);

  const weatherStations = APP_CONST.weatherStations;
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Showing loader
    setLoaderVisible(true);
    const apiPromises = [
      !isDevicesFetched ? getDevices(user) : Promise.resolve({ value: [] }), // Conditional call for getDevices
      getAdvisorySettings(user),
      getAlerts(user),
    ];
    Promise.all(apiPromises).then((responses) => {
      // Organized devices
      let deviceList = [];
      let repDevices = !isDevicesFetched
        ? responses[0]["value"]
        : fetchedDevices;
      if (!isDevicesFetched) setFetchedDevices(repDevices);
      deviceList = repDevices.map((device) => {
        let { devName, devEUI } = device;
        return { devName, devEUI };
      });
      setIsDevicesFetched(true);

      // Organized parameters
      let repAdvisorySettings = responses[1]["value"];
      let defaultParams = responses[1]["defaultSetting"];

      // Changing m/s to km/h unit
      repAdvisorySettings.forEach((item) => {
        if (item.parameter === "wind_speed") {
          item.unit = "km/h";
        }
      });
      let parameters = getOrganizedParameters(repAdvisorySettings);

      // Alerts
      let alertsResp = responses[2]?.["value"] || [];
      setAlerts(alertsResp);

      // Set state
      setParameters(parameters);
      setDevices(deviceList);
      setSelectedDevices(deviceList.map((device) => device.devEUI));
      setLoaderVisible(false);
      if (defaultParams) {
        setSelectedParam([defaultParams]);
      }
    });
  }, [user]);

  const didFetchRef = useRef(false);

  //Get average data
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    getAverage(user, selectedDevices)
      .then((response) => {
        setAvgData(response.value);
      })
      .catch((err) => {
        console.error("Error fetching average:", err);
      });
  }, [selectedDevices, user]);
  // console.log("average data", avgData);

  const handleRefresh = () => {
    // setLoaderVisible(true);
    // const apiPromises = [getSensorData(user)];

    // Promise.all(apiPromises).then((responses) => {
    //   // Organize sensor data
    //   let repSensorData = responses[0]['value'];
    //   repSensorData.forEach((sensorData) => {
    //     if (sensorData.wind_speed != null) {
    //       sensorData.wind_speed = convertMsToKmh(sensorData.wind_speed);
    //     }
    //   });

    //   let { seriesData, latestData } = getOrganizedSensorData(
    //     repSensorData,
    //     Object.keys(parameters)
    //   );
    //   setSeries(seriesData);
    //   setLast24HourEachDevice(latestData);
    //   setLoaderVisible(false);
    // });
    if (value === "tab_one") childRef.current.fetchSensorData();
    else childRef.current.fetchRainfallData();
  };

  const handleCheckboxChange = (event) => {
    event.stopPropagation();
    event.preventDefault();
    console.log("--- Inside handleCheckboxChange ---");
    let value = event.target.value;
    let isChecked = event.target.checked;
    if (isChecked) {
      setSelectedDevices([...selectedDevices, value]);
    } else {
      setSelectedDevices(selectedDevices.filter((id) => id !== value));
    }
  };

  const handleChecked = (event) => {
    event.stopPropagation();
    event.preventDefault();
    console.log("--- Inside handleChecked ---");
    setSelectedDevices(devices.map((device) => device.devEUI));
  };

  const handleUnchecked = (event) => {
    event.stopPropagation();
    event.preventDefault();
    console.log("--- Inside handleUnchecked ---");
    setSelectedDevices([]);
  };

  const [value, setValue] = React.useState("tab_one");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const childRef = React.createRef();

  const handleChartDownloadAsPdf = async () => {
    setLoaderVisible(true);
    try {
      await childRef.current.downloadChartAsPDF();
    } finally {
      console.log("PDF generation process is done");
      setLoaderVisible(false);
    }
  };

  const handleChartDownloadAsExcel = async () => {
    try {
      setLoaderVisible(true);
      await childRef.current.downloadChartAsExcel();
      setLoaderVisible(false);
    } finally {
      console.log("PDF generation process is done");
      setLoaderVisible(false);
    }
  };

  return (
    <>
      <CirclesWithBar
        color="#00bfff"
        height="70"
        width="70"
        wrapperClass="loader"
        visible={isLoaderVisible}
      />
      <div>
        <h2 style={{ marginLeft: "-3px" }}>
          <strong>Device Data</strong>
        </h2>

        <div className="row report_page">
          <div className="col-md-2 col-sm-3 col-xs-12">
            <h2 className="dev_ttlmain">Devices</h2>
            <div className="dbb chtbox">
              <div className="reports-button-container">
                <span
                  className="label label-primary"
                  style={{ padding: "6px", cursor: "pointer" }}
                  onClick={handleChecked}
                >
                  Check All
                </span>
                <span
                  className="label label-primary"
                  style={{
                    padding: "6px",
                    cursor: "pointer",
                  }}
                  onClick={handleUnchecked}
                >
                  Uncheck All
                </span>
              </div>
              <div className="list">
                {devices.length > 0 ? (
                  <DeviceList
                    deviceList={devices}
                    selectedDeviceList={selectedDevices}
                    changeHandeler={handleCheckboxChange}
                  ></DeviceList>
                ) : (
                  <div className="waiting_loader">Waiting to load data....</div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-10 col-sm-9 col-xs-12">
            <h2 className="dev_ttlmain mobile-margin">All devices average</h2>
            <div className="dbb chartbox">
              <AvgParameters avgData={avgData} />
            </div>
            <h2 className="dev_ttlmain" style={{ marginTop: "20px" }}>
              Detailed analytics
            </h2>
            <div className="dbb chtbox">
              {!isLoaderVisible ? (
                <>
                  <TabContext value={value}>
                    {weatherStations.includes(orgName) && (
                      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <div className="tab-toolbar">
                          <TabList
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                            className="tab-list"
                          >
                            <Tab
                              label="Rainfall"
                              value="tab_two"
                              className="tab-btn"
                            />
                          </TabList>
                        </div>
                      </Box>
                    )}

                    <TabPanel value="tab_one" style={{ padding: "24px 0" }}>
                      <DetailedAnalytics
                        parameters={parameters}
                        devices={devices}
                        selectedDevices={selectedDevices}
                        selectedHourly={selectedHourly}
                        selectedParam={selectedParam}
                        setSelectedHourly={setSelectedHourly}
                        setSelectedParam={setSelectedParam}
                        ref={childRef}
                      ></DetailedAnalytics>
                      <div className="tab-actions">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={handleRefresh}
                        >
                          Refresh Sensor Data
                        </button>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={handleChartDownloadAsPdf}
                        >
                          <FaDownload style={{ marginRight: "5px" }} />
                          Download as PDF
                        </button>

                        <button
                          className="btn btn-info btn-sm"
                          onClick={handleChartDownloadAsExcel}
                        >
                          <FaDownload style={{ marginRight: "5px" }} />
                          Download as Excel
                        </button>
                      </div>
                    </TabPanel>
                    {weatherStations.includes(orgName) ? (
                      <TabPanel value="tab_two" style={{ padding: "24px 0" }}>
                        <RainFallBarGraph
                          selectedDevices={selectedDevices}
                          ref={childRef}
                        />
                      </TabPanel>
                    ) : (
                      ""
                    )}
                  </TabContext>
                </>
              ) : (
                <div className="waiting_loader">Waiting to load data....</div>
              )}
            </div>
          </div>
          <div className="col-md-12 col-sm-12 col-xs-12">
            <h2 className="dev_ttlmain" style={{ marginTop: "20px" }}>
              Device advisories
            </h2>
            {!isLoaderVisible ? (
              <div style={{ marginTop: "-8px" }}>
                <AlertAdvisories alerts={alerts} />
              </div>
            ) : (
              <div className="waiting_loader">Waiting to load data....</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
