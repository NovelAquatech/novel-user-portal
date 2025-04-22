import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { APP_CONST } from "../helper/application-constant";
import { useAuth } from "../hooks/useAuth";
import { downloadExcelRailfall } from "../helper/download-utils";
import { CirclesWithBar } from "react-loader-spinner";
import {
  getRainfallData,
} from "../helper/web-service";

dayjs.extend(isoWeek);
const colors = [
  "#00bdd5",
  "#8354e2",
  "#5470C6",
  "#91CC75",
  "#FAC858",
  "#EE6666",
  "#73C0DE",
  "#FF6F91",
  "#FFB74D",
  "#64B5F6",
];

// Helper function to process data based on the selected unit
const processData = (data, unit, selectedDevices) => {
  const deviceGroupedData = {};
  const deviceNameMap = {}; // To map devEUI to devName

  // Filter data by eligible devices
  const filteredData = data.filter((item) =>
    selectedDevices.includes(item.devEUI)
  );

  // Group filtered data by device
  filteredData.forEach((item) => {
    const { devEUI, rainfall_total, devName, Timestamp } = item;

    // Map devEUI to devName
    if (!deviceNameMap[devEUI]) {
      deviceNameMap[devEUI] = devName;
    }

    // Initialize device grouped data
    if (!deviceGroupedData[devEUI]) {
      deviceGroupedData[devEUI] = {};
    }

    let groupKey;
    switch (unit) {
      case "yearly":
        groupKey = dayjs(Timestamp).format("YYYY"); // Yearly grouping
        break;
      case "monthly":
        groupKey = dayjs(Timestamp).format("YYYY-MM"); // Monthly grouping
        break;
      case "weekly":
        const weekStart = dayjs(Timestamp)
          .startOf("isoWeek")
          .format("YYYY-MM-DD");
        groupKey = weekStart; // Use the start of the week for sorting
        break;
      case "daily":
      default:
        groupKey = dayjs(Timestamp).format("YYYY-MM-DD"); // Daily grouping
    }

    // Initialize the groupKey for that device if it doesn't exist
    if (!deviceGroupedData[devEUI][groupKey]) {
      deviceGroupedData[devEUI][groupKey] = 0;
    }
    deviceGroupedData[devEUI][groupKey] += rainfall_total; // Sum rainfall_total
  });

  // Format data for chart
  const xLabels = Array.from(
    new Set(
      Object.values(deviceGroupedData).flatMap((periods) =>
        Object.keys(periods)
      )
    )
  ).sort(); // Get unique xLabels sorted

  const series = Object.keys(deviceGroupedData).map((device, index) => ({
    name: deviceNameMap[device],
    type: "bar",
    itemStyle: {
      color: colors[index % colors.length], // Assign color based on index
    },
    data: xLabels.map(
      (label) => parseFloat(deviceGroupedData[device][label].toFixed(2)) || 0
    ), // Fill data for each label
  }));

  return { xLabels, series };
};

const RainFallBarGraph = React.forwardRef(({ selectedDevices }, ref) => {
  //
  const [xAxisUnit, setXAxisUnit] = useState("daily");
  const [chartData, setChartData] = useState({ xLabels: [], series: [] });
  const [rainFallData, setRainFallData] = useState([]);
  const [isLoaderVisible, setLoaderVisible] = useState(false);

  useEffect(() => {
    console.log("hello")
    const processedData = processData(rainFallData, xAxisUnit, selectedDevices);
    setChartData(processedData);
  }, [rainFallData, selectedDevices]);

  const fetchRainfallData = async () => {
    setLoaderVisible(true);
    try {
      const rainFallResp = await getRainfallData(user, xAxisUnit);
      const rainFallDatas = rainFallResp?.["value"];
      if (rainFallDatas) {
        setRainFallData(rainFallDatas);
      }
    } catch (error) {
      console.error("Error fetching rainfall data:", error);
    } finally {
      setLoaderVisible(false);
    }
  };
  
    useEffect(() => {
      fetchRainfallData();
    }, [xAxisUnit]);

  

  // Chart options with dynamic x-axis and series
  const options = {
    title: {
      text: `Rainfall by Device and ${xAxisUnit.charAt(0).toUpperCase() + xAxisUnit.slice(1)
        }`,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      top: "bottom",
    },
    xAxis: {
      type: "category",
      data: chartData.xLabels.length ? chartData.xLabels : [""], // Empty if no data
      name: xAxisUnit.charAt(0).toUpperCase() + xAxisUnit.slice(1),
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      name: "Rainfall (mm)",
    },
    grid: {
      left: "1%",
      right: "4%",
      containLabel: true,
    },
    series: chartData.series.length
      ? chartData.series
      : [{ type: "bar", data: [] }], // Handle empty series

    graphic: chartData.xLabels.length
      ? []
      : [
        {
          type: "text",
          left: "center",
          top: "middle",
          style: {
            text: "",
            fontSize: 20,
            fontWeight: "bold",
            fill: "#ccc",
          },
        },
      ],
  };

  const { user } = useAuth();
  const farmer_companies = APP_CONST.farmer_companies;
  const orgName = user.orgName;
  const orgIcon = (farmer_companies.includes(orgName)) ? "images/logomain.png" : `https://api.cors.lol/?url=${user.orgDetails.icon}`;

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
              if (base64Image) pdf.addImage(base64Image, "PNG", 80, 10, 50, 0);
            })
            .catch((error) => {
              console.error("Error converting image to Base64, skipping icon:", error);
            })
            .finally(() => {
              const hiddenDetails = [
                { text: `Report Name: Rainfall`, x: 10, y: 20 },
                { text: `Report Frequency: ${xAxisUnit}`, x: 10, y: 30 },
              ];

              pdf.setFont("helvetica");
              pdf.setFontSize(10);
              hiddenDetails.forEach((detail) => {
                pdf.text(detail.text, detail.x, detail.y);
              });

              // Trigger the download
              pdf.save(`Rainfall-Report-${orgName}.pdf`);

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
          { title: "Date" },
          { title: "Rainfall" }
        ];
        downloadExcelRailfall(chartData, columns, user);
        resolve();
      } catch (error) {
        reject(error)
      }
    });
  };

  React.useImperativeHandle(ref, () => ({
    downloadChartAsPDF,
    downloadChartAsExcel,
    fetchRainfallData
  }));

  return (
    <>
    <div className="row">
    <div className="col-xs-12" style={{ display: "flex" }}>
        <select
          onChange={(e) => setXAxisUnit(e.target.value)}
          value={xAxisUnit}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      </div>

      
        {/* Bar chart component */}
        { isLoaderVisible ?
          <CirclesWithBar
          color="#00bfff"
          height="70"
          width="70"
          wrapperClass="loader-graph"
          visible={isLoaderVisible}
        />
        : 
        <div id="chart-container">
        <ReactEcharts
          option={options}
          style={{ height: "470px", width: "100%" }}
        /> 
        </div>
        }
      
    </>
  );
});

export default RainFallBarGraph;
