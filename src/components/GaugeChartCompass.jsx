import React from "react";

export const GaugeChartCompass = ({ formattedAvg }) => {
	const deg = `rotate(${formattedAvg}deg)`;

	return (
		<>

			<div className="compass">
				<div className="compass-inner">
					<div className="north">N</div>
					<div className="east">E</div>
					<div className="northone">NE</div>
					<div className="eastone">SW</div>
					<div className="easttwo">SE</div>
					<div className="westtwo">NW</div>
					<div className="west">W</div>
					<div className="south">S</div>
					<div
						className="main-arrow"
						style={{
							transform: deg,
							"-ms-transform": deg,
							"-o-transform": deg,
							"-moz-transform": deg,
							"-webkit-transform": deg,
						}}
					>
						<div className="arrow-up"></div>
						<div className="arrow-down"></div>
					</div>
				</div>
			</div>
			<style>
				{`

@media screen and (min-width: 2001px) {

.compass {
	width: 190px;
	height: 190px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  position:relative;
  top: -20px;
}

.compass-inner {
	width: 180px;
	  height: 180px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
    width: 15px;
    padding-top: 13%;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}

}

@media screen and (max-width: 2000px) and (min-width: 1901px) {

.compass {
	width: 170px;
	height: 170px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 160px;
	  height: 160px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
	width: 15px;
	padding-top: 3px;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}
}

@media screen and (max-width: 1900px) and (min-width: 1801px) {

.compass {
	width: 210px;
	height: 210px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 200px;
	  height: 200px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
    width: 15px;
    padding-top: 13%;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}
}
@media screen and (max-width: 1800px) and (min-width: 1701px) {

.compass {
	width: 200px;
	height: 200px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 190px;
	  height: 190px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
    width: 15px;
    padding-top: 9%;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}
}
@media screen and (max-width: 1700px) and (min-width: 1601px) {

.compass {
	width: 190px;
	height: 190px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 180px;
	  height: 180px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
    width: 15px;
    padding-top: 9%;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}
}
@media screen and (max-width: 1600px) and (min-width: 1401px) {

.compass {
	width: 170px;
	height: 170px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 160px;
	  height: 160px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
    width: 15px;
    padding-top: 9%;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}
}

@media screen and (max-width: 1400px) and (min-width: 1301px) {

.compass {
	width: 150px;
	height: 150px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 140px;
	  height: 140px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
    width: 15px;
    padding-top: 3%;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}

}
@media screen and (max-width: 1300px) and (min-width: 1200px) {

.compass {
	width: 160px;
	height: 160px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 150px;
	  height: 150px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
    width: 15px;
    padding-top: 9%;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}

}

@media screen and (max-width: 1199px) and (min-width: 768px) {

.compass {
	width: 150px;
	height: 150px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 140px;
	  height: 140px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
	width: 15px;
	padding-top: 3px;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}

}
@media screen and (max-width: 767px) and (min-width: 601px) {

.compass {
	width: 190px;
	height: 190px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 180px;
	  height: 180px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
    width: 15px;
    padding-top: 7%;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}
}

@media screen and (max-width: 600px) and (min-width: 301px) {

.compass {
	width: 190px;
	height: 190px;
	text-align: center;
	background-color: #F3F3F3;
	border-radius: 100%;
	background-image: -webkit-linear-gradient(top, #F7F7F7, #ECECEC);
  position: relative;
  margin: 0 auto;
  top: -20px;
}

.compass-inner {
	width: 180px;
	  height: 180px;
	  left: 5px;
	  top: 6px;

	background-color: #3D3D3D;
	border-radius: 100%;
	position: relative;
	border: 3px solid #C5C5C5;
}

.main-arrow {
    width: 30px;
	left: 46%;
	width: 15px;
	padding-top: 3px;
	height: 100%;
	position: relative;
	box-sizing:border-box;
  transform: rotate(45deg);
	animation: spin 2.0s alternate 2;
	-ms-transform: rotate(45deg);
	-o-transform: rotate(45deg);
	-o-animation: spin 2.0s alternate 2;
	-moz-transform: rotate(45deg);
	-moz-animation: spin 2.0s alternate 2;
	-webkit-transform: rotate(45deg);
	-webkit-animation: spin 2.0s alternate 2;
	
}

.arrow-up {
	width: 0; 
	height: 0;
	border-bottom: 62.5px solid #EF5052;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;
	position: relative;
}

.arrow-down {
	-webkit-transform: rotate(180deg); /* Safari and Chrome */
	width: 0; 
  transform: rotate(180deg);
  -ms-transform: rotate(180deg);
	height: 0;
	border-bottom: 62.5px solid #F3F3F3;
	border-left: 7.5px solid transparent;
	border-right: 7.5px solid transparent;

	position: relative;
}
}
.north {
    font-family: "Roboto", sans-serif;
    color: #FFF;
    position: absolute;
    left: 47%;
    top: 2%;
    font-size: 16px;
}

.northone {
    font-size: 16px;
    font-family: "Roboto", sans-serif;
    color: #FFF;
    position: absolute;
    left: 68%;
    top: 14%;
}

.east {
    font-family: "Roboto", sans-serif;
    color: #FFF;
    position: absolute;
    font-size: 16px;
    top: 41%;
    left: 88%;
}
.eastone {
    font-size: 16px;
    font-family: "Roboto", sans-serif;
    color: #FFF;
    position: absolute;
    left: 12%;
    top: 66%;
}
.easttwo {
    font-size: 16px;
    font-family: "Roboto", sans-serif;
    color: #FFF;
    position: absolute;
    left: 72%;
    top: 68%;
}
.west {
    font-family: "Roboto", sans-serif;
    color: #FFF;
    position: absolute;
    font-size: 16px;
    left: 4%;
    top: 40%;
}
.westtwo {
    font-size: 16px;
    font-family: "Roboto", sans-serif;
    color: #FFF;
    position: absolute;
    left: 15%;
    top: 15%;
}

.south {
    font-family: "Roboto", sans-serif;
    color: #FFF;
    position: absolute;
    font-size: 16px;
    left: 47%;
    top: 81%;
}

@keyframes spin {
    0%{
        transform:scale(1) rotate(0deg);
    }
	50% {
		transform:scale(1) rotate(80deg);
	}
	100% {
		transform:scale(1) rotate(-180deg);
	}
}

@-o-keyframes spin {
    0%{
        -webkit-transform:scale(1) rotate(0deg);
    }
	50% {
		-webkit-transform:scale(1) rotate(80deg);
	}
	100% {
		-webkit-transform:scale(1) rotate(-180deg);
	}
}

@-moz-keyframes spin {
    0%{
        -webkit-transform:scale(1) rotate(0deg);
    }
	50% {
		-webkit-transform:scale(1) rotate(80deg);
	}
    100% {
		-webkit-transform:scale(1) rotate(-180deg);
	} 
}

@-webkit-keyframes spin {
    0%{
        -webkit-transform:scale(1) rotate(0deg);
    }
	50% {
		-webkit-transform:scale(1) rotate(80deg);
	}
   100% {
		-webkit-transform:scale(1) rotate(-180deg);
	}
}

`}
			</style>
		</>
	);
};
