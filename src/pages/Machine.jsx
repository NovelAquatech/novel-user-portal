import { useState, useEffect } from "react";
import { CirclesWithBar } from "react-loader-spinner";
import * as MaterialDesign from "react-icons/md";
import { Navbar } from "../components/nav";
import { Footer } from "../components/footer";
import { useAuth } from "../hooks/useAuth";
import { getMachines, getDevices, deleteMachines } from "../helper/web-service";
import { useCacheStatus } from "../hooks/useCacheStatus";
import { useNavigate, useLocation } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
} from "@mui/material";
import { toast, Toaster } from "react-hot-toast";

export const MachinePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const {
    isDevicesFetched,
    setIsDevicesFetched,
    fetchedDevices,
    setFetchedDevices,
    isMachinesFetched,
    setIsMachinesFetched,
    fetchedMachines,
    setFetchedMachines,
  } = useCacheStatus();
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [machines, setMachines] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [selectedMachineType, setSelectedMachineType] = useState("");
  const [filterMachines, setFilterMachines] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaderVisible(true);

    const machinesPromise = (async () => {
      let shouldFetch = !isMachinesFetched || location.state?.reload;
      if (shouldFetch) {
        const data = await getMachines(user);
        setMachines(data.value);
        setFilterMachines(data.value);
        setFetchedMachines(data.value);
        setMachineTypes(["1-phase", "3-phase"]);
        setIsMachinesFetched(true);
      } else {
        setMachines(fetchedMachines);
        setFilterMachines(fetchedMachines);
        setMachineTypes(["1-phase", "3-phase"]);
      }
    })();

    const devicesPromise = (async () => {
      if (!isDevicesFetched) {
        const data = await getDevices(user);
        setDevices(data.value);
        setFetchedDevices(data.value);
        setIsDevicesFetched(true);
      } else {
        setDevices(fetchedDevices);
      }
    })();

    Promise.all([machinesPromise, devicesPromise]).then(() => {
      setLoaderVisible(false);
    });
  }, [location.state?.reload]);

  const handleChange = (event) => {
    let type = event.target.value;
    let machs = filterMachines.filter((machine) => {
      if (type) {
        return machine.option === type;
      } else {
        return true;
      }
    });
    setMachines(machs);
    setSelectedMachineType(event.target.value);
  };

  const handleDeleteClick = (machine) => {
    setSelectedMachine(machine);
    setShowPopup(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMachine) return;
    try {
      await deleteMachines(
        user,
        selectedMachine.RowKey,
        selectedMachine.devEUIs,
        selectedMachine.machineName
      ); // Call delete API
      const data = await getMachines(user);
      setMachines(data.value);
      setFilterMachines(data.value);
      setFetchedMachines(data.value);
      setIsMachinesFetched(true);
      toast.success(
        `Machine ${selectedMachine.machineName}  deleted successfully!`
      );
    } catch (error) {
      toast.error(
        error.response ||
          `Error! Failed to delete ${selectedMachine.machineName}. Please try again!`
      );
      console.error(error);
    }
    setShowPopup(false);
    setSelectedMachine(null);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
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

          <div
            className="col-md-12 col-sm-12 col-xs-12"
            style={{ marginTop: "-20px" }}
          >
            <div className="x_panel">
              <div className="col-md-12 col-sm-12 col-xs-12">
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
                  <div
                    className="ttl_main"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <h2 style={{ flex: 1 }}>
                      <strong>Machine List</strong>
                    </h2>
                    <button
                      type="button"
                      className="btn btn-info btn-sm"
                      onClick={() => navigate("/machines/new")} // Navigate on click
                    >
                      <MaterialDesign.MdAdd
                        size={18}
                        style={{ marginRight: "5px", marginBottom: "-4px" }}
                      />
                      Create New Machine
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 col-sm-6 col-xs-6">
                    <p className="text-muted font-13 m-b-30">
                      {machines.length} Machines
                    </p>
                  </div>
                  <div className="col-md-6 col-sm-6 col-xs-6 txtrgt">
                    <select value={selectedMachineType} onChange={handleChange}>
                      <option value="">Filter Machine Type</option>
                      {machineTypes.map((type, i) => (
                        <option value={type} key={i}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="x_content">
                <table id="datatable" className="table table-striped">
                  <thead>
                    <tr>
                      <th>Machine Name</th>
                      <th>Load</th>
                      <th>Option</th>
                      <th>Power Factor</th>
                      <th>Line Voltage</th>
                      <th>Primary Device</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{ textAlign: "center", padding: "10px" }}
                        >
                          No machine found
                        </td>
                      </tr>
                    ) : (
                      machines.map((machine, i) => (
                        <tr key={i}>
                          <td>
                            <MaterialDesign.MdAir color="#00bdd5" size={20} />{" "}
                            {machine.PartitionKey}
                          </td>
                          <td>{machine.load}</td>
                          <td>{machine.option}</td>
                          <td>{machine.powerFactor}</td>
                          <td>{machine.lineVoltage}</td>
                          <td>
                            {devices.find(
                              (device) =>
                                device.devEUI === machine.primaryDevEUI
                            )?.devName || "Unknown"}
                          </td>
                          <td>
                            <button
                              className="machine-transparent-btn"
                              onClick={() =>
                                navigate(`/machines/${machine.RowKey}`, {
                                  state: { machine },
                                })
                              }
                            >
                              <EditIcon />
                            </button>
                            <button
                              className="machine-transparent-btn"
                              onClick={() => handleDeleteClick(machine)}
                            >
                              <DeleteIcon />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Popup */}
      {showPopup && selectedMachine && (
        <Dialog
          open={showPopup}
          onClose={() => setShowPopup(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this machine?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmDelete}>Yes</Button>
            <Button onClick={() => setShowPopup(false)} autoFocus>
              No
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Footer />
    </>
  );
};
