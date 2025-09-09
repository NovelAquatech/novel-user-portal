import React from "react";
import { GaugeChart } from "../components/GaugeChart";
import { GaugeChartCompass } from "../components/GaugeChartCompass";
import { BarChart } from "../components/BarChart";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { APP_CONST } from "../helper/application-constant";
import CompassAnkit from "./CompassAnkit";
import Compass from "./Compass";
import CompassSVG from "./CompassSvg";
import {
  calculateAvgLatestData,
  getOrganizedDevicesAverage,
} from "../helper/utils";
// export const AvgParameters = ({
//   parameters,
//   selectedDevices,
//   last24HoursData,
// }) => {
//   const responsive = APP_CONST.avg_device_data_responsive_parameter;
//   const organizedDevicesAverage = getOrganizedDevicesAverage(
//     parameters,
//     selectedDevices,
//     last24HoursData
//   );

//   const organizedDevicesAverageFilterValve = organizedDevicesAverage.filter(
//     (item) => !item.parameter.includes("valve")
//   );
//   // // Find the wind_speed object
//   // const windSpeedIndex = organizedDevicesAverageFilterValve.findIndex(
//   //   (item) => item.parameter === "wind_speed"
//   // );

//   // // If wind_speed is found, move it to the start of the array
//   // if (windSpeedIndex !== -1) {
//   //   const windSpeed = organizedDevicesAverageFilterValve.splice(
//   //     windSpeedIndex,
//   //     1
//   //   )[0]; // Remove wind_speed from the array
//   //   organizedDevicesAverageFilterValve.unshift(windSpeed); // Add wind_speed to the beginning of the array
//   // }

//   //<GaugeChartCompass data={data} />

//   const updateParamName = (paramDisplayName) => {
//     if(paramDisplayName == 'tvoc') return paramDisplayName.toUpperCase();
//     return paramDisplayName;
//   }

//   return (
//     <Carousel
//       className="row"
//       responsive={responsive}
//       showDots={false}
//       infinite={true}
//       autoPlay={false}
//       autoPlaySpeed={1000}
//     >
//       {organizedDevicesAverageFilterValve.length > 0 ? (
//         organizedDevicesAverageFilterValve.map((data, i) => {
//           let {
//             min_value,
//             max_value,
//             low_thohresld,
//             high_thohresld,
//             paramDisplayName,
//             unit,
//             avg,
//           } = data;

//           let formattedAvg = avg % 1 === 0 ? avg : avg.toFixed(2);


//           let chartComponet = <div />;
//           switch (data.parameter) {
//             case "wind_direction":
//               chartComponet = <CompassAnkit directionAngle={avg ?? 0} />;
//               unit = "°";
//               break;
//             case "people_present":
//               let data = [
//                 {
//                   x: [""],
//                   y: [formattedAvg],
//                   width: [0.2],
//                   marker: {
//                     color: ["#75e64d"],
//                   },
//                   type: "bar",
//                 },
//               ];
//               chartComponet = <BarChart data={data} />;
//               break;
//             default:
//               chartComponet = (
//                 <GaugeChart
//                   min_value={min_value}
//                   max_value={max_value}
//                   low_thohresld={low_thohresld}
//                   high_thohresld={high_thohresld}
//                   formattedAvg={formattedAvg}
//                 />
//               );
//           }

//           return (
//             <div className="chart_section" key={i}>
//               {chartComponet}
//               { paramDisplayName != 'Co2' ? 
//               <h5 className="info">{updateParamName(paramDisplayName)}</h5>
//               : <h5 className="info">CO<sub>2</sub></h5>
//               }
//               <p className="reading_gauge">
//                 {formattedAvg} {unit}
//               </p>
//             </div>
//           );
//         })
//       ) : (
//         <div />
//       )}
//     </Carousel>
//   );
// };

/*Implemented backend changes for avg Api*/

export const AvgParameters = ({ avgData }) => {
  const responsive = APP_CONST.avg_device_data_responsive_parameter;

  // filter out valves if not needed
  const filteredAvgData = avgData.filter(
    (item) => !item.parameter.includes("valve")
  );
  return (
    <Carousel
      className="row"
      responsive={responsive}
      showDots={false}
      infinite={true}
      autoPlay={false}
      autoPlaySpeed={1000}
    >
      {filteredAvgData.length > 0 ? (
        filteredAvgData.map((data, i) => {
          const { min_value, max_value,  unit, average, parameter } = data;

          const formattedAvg =
            average % 1 === 0 ? average : average.toFixed(2);

          let chartComponet = <div />;
          switch (parameter) {
            case "wind_direction":
              chartComponet = (
                <CompassAnkit directionAngle={average ?? 0} />
              );
              break;

            case "people_present":
              const chartData = [
                {
                  x: [""],
                  y: [formattedAvg],
                  width: [0.2],
                  marker: { color: ["#75e64d"] },
                  type: "bar",
                },
              ];
              chartComponet = <BarChart data={chartData} />;
              break;

            default:
              chartComponet = (
                <GaugeChart
                  min_value={min_value}
                  max_value={max_value}
                  formattedAvg={formattedAvg}
                />
              );
          }

          return (
            <div className="chart_section" key={i}>
              {chartComponet}
              {parameter !== "co2" ? (
                <h5 className="info" style={{ textTransform: 'capitalize' }}>{parameter}</h5>
              ) : (
                <h5 className="info">
                  CO<sub>2</sub>
                </h5>
              )}
              <p className="reading_gauge">
                {formattedAvg} {unit}
              </p>
            </div>
          );
        })
      ) : (
        <div className="waiting_loader">No average data available to display.</div>
      )}
    </Carousel>
  );
};