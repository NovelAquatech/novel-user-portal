import React from "react";
import { GaugeComponent } from "react-gauge-component";
export const GaugeChart = ({data}) => {
  return (
    <>
      <GaugeComponent
        type="semicircle"
        arc={{
          width: 0.15,
          padding: 0.005,
          cornerRadius: 1,
          subArcs: [
            {
              limit: data.currentMinAlert ?? data.min_value ?? 0,
              color: "#F5CD19",
              showTick: false,
            },
            {
              limit: data.currentMaxAlert ?? data.max_value ?? 100,
              color: "#75e64d",
              showTick: false,
            },
            {
              color: "#F5CD19",
              showTick: false,
            },
          ],
        }}
        pointer={{
          color: "#345243",
          length: 0.8,
          width: 10,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (value) => value,
            hide: true,
          },
          tickLabels: {
            type: "outer",
            defaultTickValueConfig: {
              formatTextValue: (value) => value,
              style: {
                fontSize: "11px",
                fill: "#464A4F",
                width: "100px",
              },
            },
            defaultTickLineConfig: {
              length: 0,
            },
            ticks: [],
          },
        }}
        value={data.average}
        minValue={data.min_value}
        maxValue={data.max_value}
      />
    </>
  );
};
