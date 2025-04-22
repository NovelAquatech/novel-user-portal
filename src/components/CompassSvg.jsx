import React, { useEffect, useState } from "react";

const CompassSVG = ({ windDirection }) => {
  const [currentDirection, setCurrentDirection] = useState(windDirection);

  useEffect(() => {
    // Smoothly animate needle when windDirection changes
    const animationTimeout = setTimeout(() => {
      setCurrentDirection(windDirection);
    }, 1000);

    return () => clearTimeout(animationTimeout);
  }, [windDirection]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600" // Set viewBox for responsive scaling
      style={{ width: "100%", height: "100%" }} // Make it responsive to its container
      preserveAspectRatio="xMidYMid meet" // Maintain aspect ratio
    >
      {/* Background Circle */}
      <circle
        cx="150"
        cy="150"
        r="140"
        fill="#75e64d"
        stroke="#f5cd19"
        strokeWidth="10"
      />

      {/* Direction Labels */}
      <text
        x="150"
        y="30"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="20"
        fill="black"
      >
        N
      </text>
      <text
        x="260"
        y="150"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="20"
        fill="black"
      >
        E
      </text>
      <text
        x="150"
        y="270"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="20"
        fill="black"
      >
        S
      </text>
      <text
        x="40"
        y="150"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="20"
        fill="black"
      >
        W
      </text>
      <text
        x="210"
        y="50"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="14"
        fill="black"
      >
        NE
      </text>
      <text
        x="210"
        y="250"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="14"
        fill="black"
      >
        SE
      </text>
      <text
        x="90"
        y="250"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="14"
        fill="black"
      >
        SW
      </text>
      <text
        x="90"
        y="50"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="14"
        fill="black"
      >
        NW
      </text>

      {/* Needle */}
      <polygon
        points="150,150 155,40 145,40"
        fill="red"
        transform={`rotate(${currentDirection}, 150, 150)`}
      />
      <polygon
        points="150,150 155,260 145,260"
        fill="white"
        transform={`rotate(${currentDirection}, 150, 150)`}
      />

      {/* Center Circle */}
      <circle cx="150" cy="150" r="10" fill="black" />

      {/* Wind Direction Text */}
      <text
        x="150"
        y="290"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="16"
        fill="brown"
      >
        Wind Direction
      </text>
      <text
        x="150"
        y="310"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="20"
        fill="dodgerblue"
      >
        {currentDirection.toFixed(2)}°
      </text>
    </svg>
  );
};

export default CompassSVG;
