import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { APP_CONST } from "../helper/application-constant";
import { useCacheStatus } from "../hooks/useCacheStatus";
import { useQueryClient } from "react-query";
import logo from "../assets/images/logomain.png";

export const Navbar = () => {
  const { user, removeUserData } = useAuth();
   const queryClient = useQueryClient();  
  const weatherStations = APP_CONST.weatherStations;
  const { setIsDevicesFetched } = useCacheStatus();

  const orgName = user.orgName;
  const orgIcon = user.orgDetails.icon ? user.orgDetails.icon : logo;

  const handleLogout = (event) => {
    console.log("--- Inside handleLogout ---");
    queryClient.clear();
    setIsDevicesFetched(false);
    removeUserData();
  };

  return (
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
            aria-expanded="false"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand" href="/novel/report">
            <img
              src={orgIcon}
              className={orgName == "UNSW" ? "orglog" : "orglog orglog2"}
              style={{
                ...(orgName === "JoeFarm" ? { width: "100%" } : {}),
                maxWidth: "90%",
                height: "auto",
              }}
            />
          </a>
        </div>
        {/* Collect the nav links, forms, and other content for toggling */}
        <div
          className={
            user.orgName == "UNSW" || orgName == "UNSW2"
              ? "collapse navbar-collapse sm-padding-nav"
              : "collapse navbar-collapse"
          }
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav">
            <li>
              <NavLink to="/report">Reports</NavLink>
            </li>
            {user.orgName === "SeelyEnergyMonitor" && (
              <li>
                <NavLink to="/machines">Machines</NavLink>
              </li>
            )}
            <li>
              <NavLink to="/devices">Devices</NavLink>
            </li>

            <li>
              <NavLink to="/setting">Setting</NavLink>
            </li>
            {user.orgDetails.occupantSurvey ? (
              <li>
                <NavLink to="/survey">Occupant Survey</NavLink>
              </li>
            ) : null}
            {/* Show the Custom Setting tab only if orgName is in weatherStations */}
            <li
              style={{
                display: weatherStations.includes(orgName) ? "block" : "none",
              }}
            >
              <NavLink to="/customsetting">Custom Setting</NavLink>
            </li>
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <li style={{ marginTop: "10px" }}>
              <button
                type="button"
                className="btn btn-info btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
