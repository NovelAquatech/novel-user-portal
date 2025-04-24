import React, { useEffect, useState } from "react";
import { Navbar } from "../components/nav";
import { Footer } from "../components/footer";
import { CirclesWithBar } from "react-loader-spinner";
import { APP_CONST } from "../helper/application-constant";
import { useAuth } from "../hooks/useAuth";
import { QRCodeCanvas } from "qrcode.react";

export const SurveyPage = () => {
  const [isLoaderVisible, setLoaderVisible] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoaderVisible(false); // some time delay to load google sheet
    }, 2000);
  }, []);
  const { user } = useAuth();
  const orgName = user.orgName;

  let googleDocLink = user.orgDetails.occupantSurvey.googleDocLink
    // orgName === "Kolkata"
    //   ? APP_CONST.googleDocLinkKolSensors1
    //   : orgName === "UNSW"
    //   ? APP_CONST.googleDocLinkUNSW
    //   : orgName === "UNSW2"
    //   ? APP_CONST.googleDocLinkUNSW2
    //   : APP_CONST.googleDocLinkSeely;

  let googleFormURL =user.orgDetails.occupantSurvey.googleFormLink
    // orgName === "Kolkata"
    //   ? APP_CONST.googleFormLinkKolSensors1
    //   : orgName === "UNSW"
    //   ? APP_CONST.googleFormLinkUNSW
    //   : orgName === "UNSW2"
    //   ? APP_CONST.googleFormLinkUNSW2
    //   : orgName === "Seely"
    //   ? APP_CONST.googleFormLinkSeely
    //   : "";
  return (
    <>
      <CirclesWithBar
        color="#00bfff"
        height="70"
        width="70"
        wrapperClass="loader"
        visible={isLoaderVisible}
      />
      <div className="formbodymain">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <Navbar />
          </div>
          <div className="">
            <div className="col-md-12 col-sm-12 col-xs-12 report" id="style-3">
              <div className="x_panel">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div
                    className="ttl_main center"
                    style={{ marginTop: "50px" }}
                  >
                    <h2 style={{ textAlign: "left" }}>
                      Result from the Occupant Survey
                    </h2>
                  </div>
                </div>
                <div className="row">
                  <div
                    className={
                      orgName === "UNSW" ||
                      orgName === "Seely" ||
                      orgName === "UNSW2"||orgName === "Kolkata"
                        ? "col-md-10 col-sm-12 col-xs-12"
                        : "col-md-12 col-sm-12 col-xs-12"
                    }
                  >
                    <div
                      className="centerwrapperbox"
                      style={{ paddingTop: "1em" }}
                    >
                      <h2 className="dev_ttlmain"> </h2>
                      <iframe
                        id="iframe-IAQ"
                        height="500"
                        width={"100%"}
                        style={{ border: "0px" }}
                        src={googleDocLink}
                      ></iframe>
                    </div>
                  </div>
                  <div
                    className={
                      orgName == "UNSW" ||
                      orgName === "Seely" ||
                      orgName === "UNSW2"||orgName === "Kolkata"
                        ? "col-md-2 col-sm-12 col-xs-12 show-elm"
                        : "hide-elm"
                    }
                    style={{ textAlign: "center" }}
                  >
                    <h4>QR code</h4>
                    <QRCodeCanvas
                      value={googleFormURL}
                      size={200}
                      style={{ width: 200, height: 200, marginTop: "10%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
