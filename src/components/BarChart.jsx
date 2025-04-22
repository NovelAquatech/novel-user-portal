import React from "react";
import Plot from "react-plotly.js";
import moment from "moment";
import { useState, useEffect } from "react";

export const BarChart = ({ data }) => {
    return (
        <>
            <Plot
                data={data}
                layout={{
                    height: 160,
                    margin: {
                        l: 30,
                        r: 30,
                        b: 35,
                        t: 30,
                        pad: 5,
                    },
                    xaxis: {
                        automargin: true,
                    },

                    title: '', // Remove the default title here
                }}
                config={{
                    displayModeBar: false,
                    staticPlot: true
                }}
                useResizeHandler={true}
                style={{ width: "100%" }}
            />
        </>
    );
};