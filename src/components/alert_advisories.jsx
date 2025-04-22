import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { convertOperator, getAlerts } from "../helper/utils";
import { APP_CONST } from "../helper/application-constant";

export const AlertAdvisories = ({
  alerts
}) => {
  const responsive = APP_CONST.alert_advisories_responsive_parameter;
  let totalAlert = [];
  const advisoriesData = getAlerts(alerts);
  totalAlert = [...advisoriesData].reverse();
  // totalAlert = advisoriesData;

  totalAlert = totalAlert.map(alert => {
    if (alert.threshold.includes("<b>Combinator:</b>")) {
      const combinator = alert.threshold.match(/<b>Combinator:<\/b>\s*(\w+)/)[1];
      alert.msg = alert.msg.replace(/\band\b|\bor\b/gi, combinator.toLowerCase());
    }
    return alert;
  });

  const updateMsg = (msg) => {
    if (msg.toLowerCase().includes("tvoc"))
      return msg.replace(/tvoc/gi, "TVOC");
    return msg
  }

  return (totalAlert.length > 0 ?
    <Carousel
      className="row"
      responsive={responsive}
      showDots={false}
      infinite={true}
      autoPlay={false}
      autoPlaySpeed={1000}
    >
      {(
        totalAlert.map((data, i) => {
          return (
            <div
              key={i}
              className="col-md-4 col-sm-4 col-xs-12"
              style={{ width: "100%" }}
            >
              <div className="dbb ttlcent">
                <h2>
                  <img src="images/temp.jpg" />
                  {data.name} Alert
                </h2>
                <h3>{data.devName}</h3>
                <h5>{data.timeDiff}</h5>
                <div
                  className={`temp ${data.customAlert ? "custom-alert-div" : ""
                    }`}
                  dangerouslySetInnerHTML={{
                    __html: `${typeof data.value === "number"
                      ? Number.isInteger(data.value)
                        ? data.value
                        : data.value.toFixed(2)
                      : data.value
                      }${data.parameter === "wind_direction" ? "°" : data.unit}`,
                  }}
                />
                <p dangerouslySetInnerHTML={{ __html: convertOperator(updateMsg(data.msg)) || "" }} />
                <p dangerouslySetInnerHTML={{ __html: data.threshold }}></p>
              </div>
            </div>
          );
        })
      )}
    </Carousel>
    : 
    <div style={{ textAlign: "center","height": "100px" }}><b>No device advisories found.</b></div>
  );
};
