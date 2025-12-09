import { useState, useEffect, createElement } from "react";
import { CirclesWithBar } from "react-loader-spinner";
import * as MaterialDesign from "react-icons/md";
import { Navbar } from "../components/nav";
import { Footer } from "../components/footer";
import { DeviceModel } from "../components/device_model";
import { useAuth } from "../hooks/useAuth";
import { getDevices, setDeviceEmail } from "../helper/web-service";
import { differenceDate } from "../helper/utils";
import { useCacheStatus } from "../hooks/useCacheStatus";
import {
  Chip,
  Autocomplete,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import styles from "../components/SwitchComponent.module.css";
import { toast, Toaster } from "react-hot-toast";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AddDeviceModal } from "../components/AddDevice";
import axios from "axios";
import FilterListIcon from "@mui/icons-material/FilterList";

const DeviceTypeFilter = ({
  selectedDeviceType,
  handleChange,
  deviceTypes,
}) => {
  return (
    <FormControl
      size="small"
      variant="outlined"
      sx={{
        minWidth: 180,
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none", // remove border
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
        "& .MuiSelect-icon": {
          display: "none", // remove right-side SVG arrow
        },
      }}
    >
      <Select
        value={selectedDeviceType}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <FilterListIcon fontSize="large" color="action" />
              <Typography
                variant="body2"
                sx={{ lineHeight: 1.5, fontSize: "12px", color: "#555" }}
              >
                {selected || "Filter Device Type"}
              </Typography>
            </Box>
          );
        }}
      >
        <MenuItem value="">
          <em>All</em>
        </MenuItem>
        {deviceTypes.map((type, i) => (
          <MenuItem key={i} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export const DevicePage = () => {
  const { user } = useAuth();
  const {
    isDevicesFetched,
    setIsDevicesFetched,
    fetchedDevices,
    setFetchedDevices,
  } = useCacheStatus();
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [orgDevices, setOrgDevices] = useState([]);
  const [devices, setDevices] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [emailErorrs, setEmailErrors] = useState({});
  const [autoLogin, setAutoLogin] = useState([]);
  const [inputEmailValue, setInputEmailValue] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    setLoaderVisible(true);
    let deviceList = [];
    if (!isDevicesFetched) {
      getDevices(user).then((data) => {
        deviceList = data.value;
        let dTypes = [
          ...new Set(deviceList.map((device) => device.deviceType)),
        ];
        setDevices(deviceList);
        setOrgDevices(deviceList);
        setDeviceTypes(dTypes);
        setLoaderVisible(false);
        setFetchedDevices(deviceList);
        setIsDevicesFetched(true);
        setAutoLogin(user.autoLogin);
      });
    } else {
      deviceList = fetchedDevices;
      let dTypes = [...new Set(deviceList.map((device) => device.deviceType))];
      setDevices(deviceList);
      setOrgDevices(deviceList);
      setDeviceTypes(dTypes);
      setLoaderVisible(false);
      setAutoLogin(user.autoLogin);
    }
  }, []);

  const handleChange = (event) => {
    let type = event.target.value;
    let deves = orgDevices.filter((device) => {
      if (type) {
        return device.deviceType === type;
      } else {
        return true;
      }
    });
    setDevices(deves);
    setSelectedDeviceType(event.target.value);
  };

  const handleModelClose = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setOpen(false);
  };

  const handleSave = async (device, value, event) => {
    const apiSaveUrl = setDeviceEmail(user);
    const payload = {
      devEUI: device.devEUI,
      orgName: device.orgName,
      Email: JSON.stringify(value),
    };
    try {
      await axios.post(apiSaveUrl, payload);
      toast.success(`Email ${event.event} successfully!`);
    } catch (err) {
      toast.error("Error saving email. Please try again.");
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailAdd = (event, device) => {
    if (event != "blur" && event.key !== "Enter") return;
    let errorMsg = "";
    let isValid = true;
    let emailList = JSON.parse(device.email);
    const currentInputValue = inputEmailValue[device.devEUI] || "";
    if (!currentInputValue) isValid = false;
    else if (emailList.includes(currentInputValue)) {
      isValid = false;
      errorMsg = `"${currentInputValue}" is already exist for the device`;
    } else if (!isValidEmail(currentInputValue)) {
      isValid = false;
      errorMsg = `"${currentInputValue}" is not a valid email`;
    }

    if (isValid) {
      const updatedEmails = [...emailList, currentInputValue];
      const updatedDevices = devices.map((d) => {
        if (device.devEUI === d.devEUI) {
          return { ...d, email: JSON.stringify(updatedEmails) };
        }
        return d;
      });
      setDevices(updatedDevices);
      setInputEmailValue((prev) => ({ ...prev, [device.devEUI]: "" }));
      setEmailErrors((prev) => ({ ...prev, [device.devEUI]: false }));
      handleSave(device, updatedEmails, { event: "saved" });
    } else if (errorMsg) {
      toast.error(errorMsg);
      setEmailErrors((prev) => ({ ...prev, [device.devEUI]: true }));
    }
  };

  const handleEmailDelete = (value, device) => {
    let emailList = JSON.parse(device.email);
    const updatedEmails = emailList.filter((email) => email !== value);
    const updatedDevices = devices.map((d) => {
      if (device.devEUI === d.devEUI) {
        return { ...d, email: JSON.stringify(updatedEmails) };
      }
      return d;
    });
    handleSave(device, updatedEmails, { event: "deleted" });
    setDevices(updatedDevices);
  };

  const handleInputEmailChange = (event, deviceEUI, newInputValue) => {
    setInputEmailValue((prev) => ({
      ...prev,
      [deviceEUI]:
        event?.type === "keydown"
          ? isValidEmail(prev[deviceEUI])
            ? ""
            : prev[deviceEUI]
          : newInputValue,
    }));
  };
  const updatedData = async () => {
    setLoaderVisible(true);
    try {
      const data = await getDevices(user);
      const deviceList = data.value || [];
      const dTypes = [...new Set(deviceList.map((d) => d.deviceType))];
      setDevices(deviceList);
      setOrgDevices(deviceList);
      setDeviceTypes(dTypes);
      setFetchedDevices(deviceList);
    } catch (err) {
      toast.error("Error refreshing device list.");
    } finally {
      setLoaderVisible(false);
    }
  };

  const onCloseCreateModal = async (event) => {
    const closedByUser = !event;
    setCreateModalOpen(false);
    if (closedByUser) updatedData();
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
            style={{  minHeight: "100vh" }}
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
                  <h2>
                    <strong>Device List</strong>
                  </h2>
                </div>
                <div className="row">
                  <div className="col-md-6 col-sm-6 col-xs-6">
                    <p className="text-muted font-13 m-b-30">
                      {devices.length} Devices
                    </p>
                  </div>
                  <div className="col-md-6 col-sm-6 col-xs-6 txtrgt">
                    {user.orgName === "JoeFarm" && (
                      <button
                        className="btn btn-info btn-sm"
                        style={{
                          marginTop: "10px",
                          marginLeft: "auto",
                        }}
                        onClick={() =>
                          window.open(
                            "https://maps.app.goo.gl/TA5SowVoHuABRwms9",
                            "_blank"
                          )
                        }
                      >
                        <FaMapMarkerAlt style={{ marginRight: "5px" }} />
                        Click To View Farm
                      </button>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      <DeviceTypeFilter
                        selectedDeviceType={selectedDeviceType}
                        handleChange={handleChange}
                        deviceTypes={deviceTypes}
                      />
                      <Button
                        onClick={() => setCreateModalOpen(true)}
                        variant="contained"
                        color="primary"
                        style={{
                          color: "#ffffff",
                          verticalAlign: "middle",
                          marginTop: "5px",
                          marginRight: "10px",
                          width: "130px",
                        }}
                        className={`btn btn-success ${styles.save_btn}`}
                      >
                        + Add Device
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="x_content">
                <div>
                  <table
                    id="datatable"
                    className="table table-striped"
                    style={{ minWidth: "1000px" }}
                  >
                    <thead>
                      <tr>
                        <th>Device Name</th>
                        <th>Last Update</th>
                        <th>Device Type</th>
                        <th>Email</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.map((device, i) => {
                        let delta = differenceDate(
                          new Date(device.lastUpdate),
                          new Date()
                        );
                        return (
                          <tr key={i}>
                            <td>
                              <MaterialDesign.MdAir color="#00bdd5" size={20} />{" "}
                              {device.devName}
                            </td>
                            <td>{delta}</td>
                            <td>{device.deviceType}</td>
                            <td style={{ width: "600px" }}>
                              <Autocomplete
                                size="small"
                                disabled={autoLogin}
                                multiple
                                freeSolo
                                options={[]}
                                disableClearable
                                value={
                                  device.email ? JSON.parse(device.email) : ""
                                }
                                inputValue={
                                  inputEmailValue[device.devEUI] || ""
                                }
                                onInputChange={(_, newInputValue) =>
                                  handleInputEmailChange(
                                    _,
                                    device.devEUI,
                                    newInputValue
                                  )
                                }
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => (
                                    <Chip
                                      {...getTagProps({ index })}
                                      key={option}
                                      size="small"
                                      className="device-email-field"
                                      label={option}
                                      onDelete={() =>
                                        handleEmailDelete(option, device)
                                      }
                                    />
                                  ))
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    className="device-email-field"
                                    placeholder="Type and press enter"
                                    onKeyDown={(e) => handleEmailAdd(e, device)}
                                    onBlur={() =>
                                      handleEmailAdd("blur", device)
                                    }
                                    error={emailErorrs[device.devEUI] || false}
                                    style={{
                                      borderColor: emailErorrs[device.devEUI]
                                        ? "red"
                                        : "",
                                      borderWidth: emailErorrs[device.devEUI]
                                        ? "2px"
                                        : "",
                                    }}
                                  />
                                )}
                                style={{ marginTop: "-6px" }}
                              />
                            </td>
                            <th>
                              <img
                                src="images/eye.jpg"
                                data-device={JSON.stringify(device)}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  let device = null;
                                  try {
                                    device = JSON.parse(
                                      event.target.getAttribute("data-device")
                                    );
                                  } catch (err) {
                                    console.log(
                                      "Error occurred to parse the data-device"
                                    );
                                  }
                                  setOpen(true);
                                  setSelectedDevice(device);
                                }}
                              />
                            </th>
                            <td></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedDevice != null ? (
        <DeviceModel
          isOpen={isOpen}
          closeModel={handleModelClose}
          device={selectedDevice}
        />
      ) : (
        ""
      )}
      <AddDeviceModal
        isOpen={isCreateModalOpen}
        onDeviceAdded={updatedData}
        onCloseCreateModal={onCloseCreateModal}
      />
    <Footer />
    </>
  );
};