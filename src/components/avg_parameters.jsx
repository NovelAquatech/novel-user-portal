import React from "react";
import { GaugeChart } from "../components/GaugeChart";
import { BarChart } from "../components/BarChart";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { APP_CONST } from "../helper/application-constant";
import CompassAnkit from "./CompassAnkit";



/*Implemented backend changes for avg Api*/

export const AvgParameters = ({ avgData }) => {
  // console.log("avgData in avg param component", avgData);
  const responsive = APP_CONST.avg_device_data_responsive_parameter;

  // filter out valves if not needed
  // const filteredAvgData = avgData.filter(
  //   (item) => !item.parameter.includes("valve")
  // );

  return (
    <Carousel
      className="row"
      responsive={responsive}
      showDots={false}
      infinite={true}
      autoPlay={false}
      autoPlaySpeed={1000}
    >
      {avgData.length > 0 ? (
        avgData.map((data, i) => {
          const { average, parameter } = data;

          let chartComponet = <div />;
          switch (parameter) {
            case "wind_direction":
              chartComponet = <CompassAnkit directionAngle={average ?? 0} />;
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
              chartComponet = <GaugeChart data={data} />;
          }

          return (
            <div className="chart_section" key={i}>
              {chartComponet}
              {parameter !== "co2" ? (
                <h5 className="info" style={{ textTransform: "capitalize" }}>
                  {parameter}
                </h5>
              ) : (
                <h5 className="info">
                  CO<sub>2</sub>
                </h5>
              )}
              <p className="reading_gauge">
                {data.average} {data.unit}
              </p>
            </div>
          );
        })
      ) : (
        <div className="waiting_loader">
          No average data available to display.
        </div>
      )}
    </Carousel>
  );
};
