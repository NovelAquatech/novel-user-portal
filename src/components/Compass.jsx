import React, { useEffect, useState } from "react";
import styles from "./Compass.module.css"; // Import CSS module

const Compass = ({ windDirection }) => {
  const [currentDirection, setCurrentDirection] = useState(windDirection);

  useEffect(() => {
    setCurrentDirection(0);
    // Smoothly animate needle when windDirection changes
    const animationTimeout = setTimeout(() => {
      setCurrentDirection(windDirection);
    }, 1000); // Delay to create a smooth animation effect

    return () => clearTimeout(animationTimeout);
  }, [windDirection]);

  const stylesContainer = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    width: "50%", // Make container full width
    maxWidth: "300px", // Set max width for larger screens
  };

  const stylesCompass = {
    position: "relative",
    width: "80%", // Set width in percentage
    paddingBottom: "80%", // Maintain 1:1 aspect ratio
    borderRadius: "50%",
    backgroundColor: "#75e64d",
    border: "5px solid #f5cd19",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const semicircleGaugeStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Make sure it takes the full width if needed
    flexDirection: "column",
  };

  return (
    <div style={{ width: "100%", alignItems: "center" }}>
      <div className="gauge">
        <div className="semicircle-gauge" style={semicircleGaugeStyles}>
          <div style={stylesContainer}>
            <div style={stylesCompass}>
              {/* White base of the needle */}
              <div
                className={styles.needleBase}
                style={{ transform: `rotate(${currentDirection + 180}deg)` }}
              />
              {/* Red tip of the needle */}
              <div
                className={styles.needle}
                style={{ transform: `rotate(${currentDirection}deg)` }}
              />

              {/* Individual direction labels */}
              <div className={styles.north}>N</div>
              <div className={styles.northEast}>NE</div>
              <div className={styles.east}>E</div>
              <div className={styles.southEast}>SE</div>
              <div className={styles.south}>S</div>
              <div className={styles.southWest}>SW</div>
              <div className={styles.west}>W</div>
              <div className={styles.northWest}>NW</div>
            </div>
            {/* Display wind direction in degrees */}
          </div>
          <div className="info" style={{ position: "relative" }}>
            <h5 style={{ marginBottom: "2px" }}>Wind Direction</h5>
          </div>
          <div className="reading_gauge">
            <div>{parseFloat(windDirection.toFixed(2))}°</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// const Compass = ({}) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="200"
//       height="250"
//       viewBox="0 0 200 250"
//     >
//       <defs>
//         <filter id="blur" x="-5%" y="-5%" width="110%" height="110%">
//           <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
//         </filter>
//       </defs>
//       <circle
//         cx="100"
//         cy="100"
//         r="90"
//         fill="lightgreen"
//         stroke="orange"
//         stroke-width="5"
//         filter="url(#blur)"
//       />

//       <text
//         x="100"
//         y="25"
//         font-size="16"
//         text-anchor="middle"
//         fill="black"
//         font-family="Arial"
//       >
//         N
//       </text>
//       <text
//         x="100"
//         y="190"
//         font-size="16"
//         text-anchor="middle"
//         fill="black"
//         font-family="Arial"
//       >
//         S
//       </text>
//       <text
//         x="25"
//         y="100"
//         font-size="16"
//         text-anchor="middle"
//         fill="black"
//         font-family="Arial"
//       >
//         W
//       </text>
//       <text
//         x="175"
//         y="100"
//         font-size="16"
//         text-anchor="middle"
//         fill="black"
//         font-family="Arial"
//       >
//         E
//       </text>
//       <text
//         x="140"
//         y="40"
//         font-size="12"
//         text-anchor="middle"
//         fill="black"
//         font-family="Arial"
//       >
//         NE
//       </text>
//       <text
//         x="60"
//         y="40"
//         font-size="12"
//         text-anchor="middle"
//         fill="black"
//         font-family="Arial"
//       >
//         NW
//       </text>
//       <text
//         x="140"
//         y="160"
//         font-size="12"
//         text-anchor="middle"
//         fill="black"
//         font-family="Arial"
//       >
//         SE
//       </text>
//       <text
//         x="60"
//         y="160"
//         font-size="12"
//         text-anchor="middle"
//         fill="black"
//         font-family="Arial"
//       >
//         SW
//       </text>

//       <polygon points="100,100 110,20 90,100" fill="red" />
//       <polygon points="100,100 110,180 90,100" fill="white" />

//       <text
//         x="100"
//         y="215"
//         font-size="16"
//         text-anchor="middle"
//         fill="brown"
//         font-family="Arial"
//       >
//         Wind Direction
//       </text>
//       <text
//         x="100"
//         y="235"
//         font-size="20"
//         text-anchor="middle"
//         fill="dodgerblue"
//         font-family="Arial"
//       >
//         120°
//       </text>
//     </svg>
//   );
// };

export default Compass;
