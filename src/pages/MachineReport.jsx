import React from "react";
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
import { convertMsToKmh } from "../helper/utils";
import {
  getSensorData,
  getMachines,
  getAdvisorySettings,
  getDevices,
} from "../helper/web-service";
import { DetailedAnalytics } from "../components/detailed_analytics";
import { FaDownload } from "react-icons/fa";
import {
  getOrganizedParameters,
  getOrganizedSensorData,
} from "../helper/utils";
import { GaugeChart } from "../components/GaugeChart";
import Carousel from "react-multi-carousel";
import moment from "moment";

export default function MachineReportPage() {
  const childRef = React.createRef();
  const { user } = useAuth();
  const {
    isMachinesFetched,
    setIsMachinesFetched,
    fetchedMachines,
    setFetchedMachines,
    isDevicesFetched,
    setIsDevicesFetched,
    fetchedDevices,
    setFetchedDevices,
  } = useCacheStatus();
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [machines, setMachines] = useState([]);
  const orgName = user.orgName;
  const responsive = APP_CONST.machine_powerFactor_data_responsive;
  const [parameters, setParameters] = useState([]);
  const [series, setSeries] = useState(null);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [selectedHourly, setSelectedHourly] = useState("last_hour");
  const [selectedParam, setSelectedParam] = useState(
    orgName === "SeelyEnergyMonitor"
      ? [APP_CONST.default_parameter_Seely]
      : [APP_CONST.default_parameter]
  );
  const [value, setValue] = React.useState("tab_one");
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    // Showing loader
    setLoaderVisible(true);
    const apiPromises = [
      !isDevicesFetched ? getDevices(user) : Promise.resolve({ value: [] }),
      !isMachinesFetched ? getMachines(user) : Promise.resolve({ value: [] }),
      getAdvisorySettings(user),
      getSensorData(user),
    ];

    Promise.all(apiPromises).then((responses) => {
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

      let machineList = [];
      let repMachines = !isMachinesFetched
        ? responses[1]["value"]
        : fetchedMachines;
      if (!isMachinesFetched) setFetchedMachines(repMachines);
      machineList = repMachines;
      setIsMachinesFetched(true);

      // Organized parameters
      let repAdvisorySettings = responses[2]["value"];
      // Changing m/s to km/h unit
      repAdvisorySettings.forEach((item) => {
        if (item.parameter === "wind_speed") {
          item.unit = "km/h";
        }
      });
      let parameters = getOrganizedParameters(repAdvisorySettings, true);

      // Organized sensor data
      let repSensorData = responses[3]["value"];
      repSensorData.forEach((sensorData) => {
        if (sensorData.wind_speed != null) {
          // Check if wind_speed exists and is not null
          sensorData.wind_speed = convertMsToKmh(sensorData.wind_speed);
        }
      });
      let { seriesData } = getOrganizedSensorData(
        repSensorData,
        Object.keys(parameters)
      );

      // Set state
      setParameters(parameters);
      setSeries(seriesData);
      setMachines(machineList);
      setDevices(deviceList);
      setSelectedMachines(machineList.map((machine) => machine.RowKey));
      setLoaderVisible(false);
      setSensorData(repSensorData);
    });
  }, [user]);

  const extractDevices = () => {
    const devEUIsArray = machines
      .filter((item) => selectedMachines.includes(item.RowKey))
      .flatMap((item) => JSON.parse(item.devEUIs));
    setSelectedDevices(devEUIsArray);
    console.log("selecteddevice", selectedDevices);
  };

  useEffect(() => {
    extractDevices();
  }, [selectedMachines]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleRefresh = () => {
    setLoaderVisible(true);
    const apiPromises = [getSensorData(user)];

    Promise.all(apiPromises).then((responses) => {
      // Organize sensor data
      let repSensorData = responses[0]["value"];
      repSensorData.forEach((sensorData) => {
        if (sensorData.wind_speed != null) {
          sensorData.wind_speed = convertMsToKmh(sensorData.wind_speed);
        }
      });

      let { seriesData } = getOrganizedSensorData(
        repSensorData,
        Object.keys(parameters)
      );
      setSeries(seriesData);
      setLoaderVisible(false);
    });

    childRef.current.fetchSensorData();
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setSelectedMachines((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((id) => id !== value)
    );
  };

  // Select all checkboxes
  const handleCheckAll = () => {
    setSelectedMachines(machines.map((machine) => machine.RowKey));
  };

  // Unselect all checkboxes
  const handleUncheckAll = () => {
    setSelectedMachines([]);
    console.log(machines);
  };

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


  const latestPowerData =
    selectedDevices.length > 0
      ? selectedDevices
          .map((devEUI) => {
            const machine = machines.find((m) => m.primaryDevEUI === devEUI);
            if (!machine) return null;

            const latestEntry = sensorData
              .filter((item) => item.devEUI === devEUI)
              .reduce(
                (latest, item) =>
                  !latest ||
                  moment(item.Timestamp).isAfter(moment(latest.Timestamp))
                    ? item
                    : latest,
                null
              );

            const powerParam = parameters.power;

            if (!powerParam || !latestEntry) return null;
            return latestEntry
              ? {
                  devEUI: latestEntry.devEUI,
                  power: latestEntry.power,
                  partitionKey: machine.PartitionKey,
                  lowThreshold: powerParam.currentMinAlert,
                  highThreshold: powerParam.currentMaxAlert,
                  minValue: powerParam.min_value,
                  maxValue: powerParam.max_value,
                  unit: powerParam.unit,
                }
              : null;
          })
          .filter(Boolean)
      : [];

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
        <div>
          <h2 style={{marginLeft: '-3px'}}>
            <strong>Machine Data</strong>
          </h2>

          <div className="row report_page">
            <div className="col-md-2 col-sm-3 col-xs-12">
              <h2 className="dev_ttlmain">Machines</h2>
              <div className="dbb chtbox">
                <div className="reports-button-container">
                  <span
                    className="label label-primary"
                    style={{ padding: "6px", cursor: "pointer" }}
                    onClick={handleCheckAll}
                  >
                    Check All
                  </span>
                  <span
                    className="label label-primary"
                    style={{
                      padding: "6px",
                      cursor: "pointer",
                    }}
                    onClick={handleUncheckAll}
                  >
                    Uncheck All
                  </span>
                </div>
                <div className="list" style={{ marginTop: "8px" }}>
                  {machines.length > 0 ? (
                    machines.map((machine) => (
                      <div key={machine.RowKey} className="checkbox-container">
                        <input
                          type="checkbox"
                          value={machine.RowKey}
                          checked={selectedMachines.includes(machine.RowKey)}
                          onChange={handleCheckboxChange}
                        />
                        <label style={{ marginLeft: "5px" }}>
                          {machine.PartitionKey}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="waiting_loader">
                      Waiting to load data...
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-10 col-sm-9 col-xs-12">
              <h2 className="dev_ttlmain mobile-margin">All Machines Power</h2>
              <div className="dbb chartbox">
                {latestPowerData.length > 0 ? (
                  <Carousel
                    className="row"
                    responsive={responsive}
                    showDots={false}
                    infinite={true}
                    autoPlay={false}
                    autoPlaySpeed={1000}
                  >
                    {latestPowerData.map((machine) => (
                      <div className="chart_section" key={machine.devEUI}>

                        <GaugeChart
                          min_value={machine.minValue}
                          max_value={machine.maxValue}
                          low_thohresld={machine.lowThreshold}
                          high_thohresld={machine.highThreshold}
                          formattedAvg={machine.power}
                        />

                        <h5 className="info">
                          {machine.partitionKey || "Unknown Machine"}
                        </h5>
                        <p className="reading_gauge">
                          {typeof machine.power === "number" &&
                          !isNaN(machine.power)
                            ? machine.power.toFixed(2)
                            : 0}
                          {machine.unit}
                        </p>
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <div className="waiting_loader">Waiting to load data....</div>
                )}
              </div>
              <h2 className="dev_ttlmain" style={{marginTop: '20px'}}>Detailed analytics</h2>
              <div className="dbb chtbox">
                {series ? (
                  <>
                    <TabContext value={value}>
                      <Box
                        sx={{
                          borderBottom: 1,
                          borderColor: "divider",
                        }}
                      >
                        <TabList
                          onChange={handleChange}
                          aria-label="lab API tabs example"
                        >
                          <Tab
                            label="Detailed Analysis"
                            value="tab_one"
                            className="tab-btn"
                          />
                          <span
                            className="label label-primary"
                            style={{
                              padding: "6px",
                              cursor: "pointer",
                              marginTop: "auto",
                              marginBottom: "12px",
                              marginLeft: "10px",
                            }}
                            onClick={handleRefresh}
                          >
                            Refresh Sensor Data
                          </span>
                          <button
                            className="btn btn-info btn-sm"
                            style={{
                              marginTop: "10px",
                              marginLeft: "auto",
                              display: "flex",
                              alignItems: "center",
                            }}
                            onClick={handleChartDownloadAsPdf}
                          >
                            <FaDownload style={{ marginRight: "5px" }} />
                            Download as PDF
                          </button>

                          <button
                            className="btn btn-info btn-sm"
                            style={{
                              marginTop: "10px",
                              display: "flex",
                              alignItems: "center",
                            }}
                            onClick={handleChartDownloadAsExcel}
                          >
                            <FaDownload style={{ marginRight: "5px" }} />
                            Download as Excel
                          </button>
                        </TabList>
                      </Box>
                      <TabPanel value="tab_one" style={{ padding: "24px 0" }}>
                        <DetailedAnalytics
                          parameters={parameters}
                          devices={devices}
                          selectedDevices={selectedDevices}
                          selectedHourly={selectedHourly}
                          selectedParam={selectedParam}
                          setSelectedHourly={setSelectedHourly}
                          setSelectedParam={setSelectedParam}
                          machines={machines}
                          ref={childRef}
                        ></DetailedAnalytics>
                      </TabPanel>
                    </TabContext>
                  </>
                ) : (
                  <div className="waiting_loader">Waiting to load data....</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
