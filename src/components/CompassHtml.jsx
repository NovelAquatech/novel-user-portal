import React from "react";
import styles from "./CompassHtml.module.css";
const CompassHtml = ({ rotate }) => {
  const mainArrowStyle = {
    height: "100%",
    width: "30px",
    left: "50%",
    top: "50%",
    position: "relative",
    paddingTop: "5px",
    boxSizing: "border-box",
    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    animation: "spin 2s alternate 2",
    msTransform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    oTransform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    mozTransform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    webkitTransform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    oAnimation: "spin 2s alternate 2",
    mozAnimation: "spin 2s alternate 2",
    webkitAnimation: "spin 2s alternate 2",
  };
  const keyframes = `
    @keyframes spin {
      0% {
        transform: translate(-50%, -50%) rotate(0deg);
      }
      100% {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  `;
  return (
    <div className={styles.compass}>
      <div className={styles.compassInner}>
        <div className={styles.north}>N</div>
        <div className={styles.east}>E</div>
        <div className={styles.northone}>NE</div>
        <div className={styles.eastone}>SW</div>
        <div className={styles.easttwo}>SE</div>
        <div className={styles.westtwo}>NW</div>
        <div className={styles.west}>W</div>
        <div className={styles.south}>S</div>
        <style>{keyframes}</style>
        <div style={mainArrowStyle}>
          <div className={styles.arrowUp}></div>
          <div className={styles.arrowDown}></div>
        </div>
      </div>
    </div>
  );
};

export default CompassHtml;
