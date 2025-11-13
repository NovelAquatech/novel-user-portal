import { useState, useEffect } from "react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import "react-multi-carousel/lib/styles.css";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "../components/nav";
import { Footer } from "../components/footer";

import MachineReportPage from "./MachineReport";
import DeviceReport from "./DeviceReport"

export const ReportPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(user.orgName === "SeelyEnergyMonitor" ? "machine" : "device");

   const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <>
      <div className="formbodymain">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <Navbar />
          </div>
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div className={isDesktop ? 'x_panel' : ''}>
              <div className={isDesktop ? "col-md-12 col-sm-12 col-xs-12" : "" }>
                <div
                  className={
                    user.orgName == "UNSW" || user.orgName == "UNSW2"
                      ? "ttl_main sm-padding"
                      : "ttl_main"
                  }
                >
                  <h2 style={{ textAlign: "center" }}>
                    <strong
                      className={
                        user.orgName == "SeelyEnergyMonitor"
                          ? "show-elm"
                          : "hide-elm"
                      }
                    >
                      Seeley Energy Monitor
                    </strong>
                  </h2>
                </div>

                {user.orgName === "SeelyEnergyMonitor" && (
                  <Tabs
                    value={activeTab}
                    onChange={(event, newValue) => setActiveTab(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                  >
                    <Tab label="Machines" value="machine" />
                    <Tab label="Devices" value="device" />
                  </Tabs>
                )}
                {activeTab === "machine" && (
                  <MachineReportPage
                  />
                )}
                {activeTab === "device" && (
                  <DeviceReport />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
