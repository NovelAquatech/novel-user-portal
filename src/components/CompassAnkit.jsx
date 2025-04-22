// import { useEffect, useRef, useState } from "react";
// import "./styles.scss";
// const CompassAnkit = ({ directionAngle = 0 }) => {
//   const [direction, setDirection] = useState(directionAngle);
//   const compassRef = useRef < HTMLDivElement > null; // Correct useRef syntax

//   useEffect(() => {
//     setDirection(directionAngle);
//   }, [directionAngle]);

//   return (
//     <div className="compass mt-2">
//       {" "}
//       {/* Using useRef safely */}
//       <div className="compass__windrose">
//         <div className="compass__mark--direction-h"></div>
//         <div className="compass__mark--direction-v"></div>
//         <div className="compass__mark--direction-d1"></div>
//         <div className="compass__mark--direction-d2"></div>
//       </div>
//       <div className="compass__arrow-container">
//         <div
//           style={{ transform: `rotate(${direction}deg)` }} // Correct styling syntax
//           className="compass__arrow"
//         />
//       </div>
//     </div>
//   );
// };

import "./styles.scss";
const CompassAnkit = ({ directionAngle = 0 }) => {
  return (
    <div
      className="compass-container gauge"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div className="compass">
        <div className="compass__windrose">
          <div className="compass__mark--direction-h"></div>
          <div className="compass__mark--direction-v"></div>
          <div className="compass__mark--direction-d1"></div>
          <div className="compass__mark--direction-d2"></div>
        </div>

        <div className="compass__arrow-container">
          <div
            style={{ transform: `rotate(${directionAngle}deg)` }}
            className="compass__arrow"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CompassAnkit;
