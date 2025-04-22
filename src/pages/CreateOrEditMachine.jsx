import {
  Button,
  TextInput,
  NumberInput,
  Select,
  MultiSelect,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { setMachines, getDevices } from "../helper/web-service";
import { APP_CONST } from "../helper/application-constant";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "../components/nav";
import * as MaterialDesign from "react-icons/md";
import { useCacheStatus } from "../hooks/useCacheStatus";
import { CirclesWithBar } from "react-loader-spinner";
import { toast, Toaster } from "react-hot-toast";
import { Footer } from "../components/footer";
import axios from "axios";

export const CreateOrEditMachinePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { RowKey } = useParams();
  const isNew = RowKey === "new";
  const machine = location.state?.machine || {};
  const {
    isDevicesFetched,
    setIsDevicesFetched,
    fetchedDevices,
    setFetchedDevices,
  } = useCacheStatus();

  const [formData, setFormData] = useState({
    name: isNew ? "" : machine.PartitionKey || "",
    option: isNew ? "" : machine.option || "",
    powerFactor: isNew ? "" : machine.powerFactor ?? 0,
    load: isNew ? "" : machine.load || "",
    lineVoltage: isNew ? "" : machine.lineVoltage ?? 0,
    devEUIs: isNew ? [] : JSON.parse(machine.devEUIs) || [],
    primaryDevEUI: isNew ? "" : machine.primaryDevEUI || "",
  });

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [devices, setDevices] = useState([]);

  const deviceOptions = devices.map((device) => ({
    value: device.devEUI,
    label: device.devName,
  }));

  useEffect(() => {
    setLoading(true);
    let deviceList = [];
    if (!isDevicesFetched) {
      getDevices(user).then((data) => {
        deviceList = data.value;
        setDevices(deviceList);
        setLoading(false);
        setFetchedDevices(deviceList);
        setIsDevicesFetched(true);
      });
    } else {
      deviceList = fetchedDevices;
      setDevices(deviceList);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const isNameValid =
      formData.name.length >= APP_CONST.CREATE_MACHINE_NAME_MIN &&
      formData.name.length <= APP_CONST.CREATE_MACHINE_NAME_MAX;
    const isPowerFactorValid =
      formData.powerFactor !== "" &&
      formData.powerFactor > 0 &&
      formData.powerFactor <= 1;
    const isLineVoltageValid =
      formData.lineVoltage !== "" &&
      formData.lineVoltage > 0 &&
      formData.lineVoltage <= 1000;
    const isPrimaryDevEUIValid =
      formData.primaryDevEUI !== "" && formData.primaryDevEUI != null;
    const isLoadValid = formData.load !== "" && formData.load !== null;
    const isOptionValid = formData.option !== "" && formData.option !== null;

    const expectedDevices = formData.option === "1-phase" ? 1 : 3;
    const isDevEUIsValid = formData.devEUIs.length === expectedDevices;

    setIsValid(
      isNameValid &&
        isPowerFactorValid &&
        isLineVoltageValid &&
        isDevEUIsValid &&
        isPrimaryDevEUIValid &&
        isLoadValid &&
        isOptionValid
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSaveLoading(true);

    const apiSaveUrl = setMachines(user);

    const payload = {
      machineName: formData.name,
      machineId: isNew ? `rowKey-${uuidv4()}` : machine.RowKey,
      load: formData.load,
      option: formData.option,
      powerFactor: formData.powerFactor,
      lineVoltage: formData.lineVoltage,
      devEUIs: formData.devEUIs,
      primaryDevEUI: formData.primaryDevEUI,
      orgName: user.orgName,
    };
    
    try {
      await axios.post(apiSaveUrl, payload);
      toast.success(`Machine ${isNew ? "created" : "saved"} successfully!`);
      setTimeout(() => {
        setSaveLoading(false);
        navigate("/machines", { state: { reload: true } });
      }, 2000);
    } catch (err) {
      toast.error(
        err.response.data.message || `Error ${isNew ? 'creating' : 'saving'} machine. Please try again!`
      );
      setSaveLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <CirclesWithBar
        color="#00bfff"
        height="70"
        width="70"
        wrapperClass="loader"
        visible={loading}
      />
      <div className="formbodymain">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <Navbar />
          </div>
          <div className="machine-container">
            <div className="machine-title-container">
              <button
                type="button"
                className="btn btn-info btn-sm machine-back-btn"
                onClick={() => navigate("/machines")}
              >
                <MaterialDesign.MdArrowBack
                  size={18}
                  style={{ marginRight: "5px", marginBottom: "-4px" }}
                />
                Back
              </button>
              <h2 className="machine-title ttl_main">
                <strong>Seeley Energy Monitor</strong>
              </h2>
            </div>
            <div className="machine-form-container">
              <h2>{isNew ? "Create New Machine" : "Edit Machine"}</h2>
              <form onSubmit={handleSubmit} className="machine-form">
                <TextInput
                  label="Machine Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="machine-input"
                  size="xl"
                  error={
                    formData.name.length > 0 &&
                    (formData.name.length < APP_CONST.CREATE_MACHINE_NAME_MIN ||
                      formData.name.length > APP_CONST.CREATE_MACHINE_NAME_MAX)
                      ? `Name must be between ${APP_CONST.CREATE_MACHINE_NAME_MIN} and ${APP_CONST.CREATE_MACHINE_NAME_MAX} characters`
                      : null
                  }
                />

                <Select
                  label="Phase Option"
                  name="option"
                  data={["1-phase", "3-phase"]}
                  value={formData.option}
                  onChange={(value) =>
                    setFormData({ ...formData, option: value })
                  }
                  required
                  className="machine-input"
                  size="xl"
                />

                <Select
                  label="Load"
                  name="load"
                  data={["Star Connected", "Delta Connected"]}
                  value={formData.load}
                  onChange={(value) =>
                    setFormData({ ...formData, load: value })
                  }
                  required
                  className="machine-input"
                  size="xl"
                />

                <NumberInput
                  label="Power Factor"
                  name="powerFactor"
                  value={formData.powerFactor}
                  onChange={(value) =>
                    setFormData({ ...formData, powerFactor: value })
                  }
                  min={0}
                  max={1}
                  allowNegative={false}
                  required
                  className="machine-input"
                  size="xl"
                  hideControls
                  error={
                    formData.powerFactor === "" ||
                    (formData.powerFactor > 0 && formData.powerFactor <= 1)
                      ? null
                      : "Value must be between 0 and 1"
                  }
                />

                <NumberInput
                  label="Line Voltage"
                  name="lineVoltage"
                  value={formData.lineVoltage}
                  onChange={(value) =>
                    setFormData({ ...formData, lineVoltage: value })
                  }
                  required
                  className="machine-input"
                  size="xl"
                  hideControls
                  error={
                    formData.lineVoltage === "" ||
                    (formData.lineVoltage > 0 && formData.lineVoltage <= 1000)
                      ? null
                      : "Value must be between 0 and 1000"
                  }
                />

                <MultiSelect
                  label="Select Devices"
                  name="devEUIs"
                  data={deviceOptions}
                  value={formData.devEUIs}
                  onChange={(value) =>
                    setFormData({ ...formData, devEUIs: value })
                  }
                  required
                  className="machine-input"
                  size="xl"
                  error={
                    formData.option &&
                    (formData.option === "1-phase" &&
                    formData.devEUIs.length !== 1
                      ? "1-phase requires exactly 1 device"
                      : formData.option === "3-phase" &&
                        formData.devEUIs.length !== 3
                      ? "3-phase requires exactly 3 devices"
                      : null)
                  }
                />

                <Select
                  label="Primary Device"
                  name="primaryDevEUI"
                  value={formData.primaryDevEUI}
                  onChange={(value) =>
                    setFormData({ ...formData, primaryDevEUI: value })
                  }
                  data={
                    formData.devEUIs.length > 0
                      ? deviceOptions.filter((device) =>
                          formData.devEUIs.includes(device.value)
                        )
                      : []
                  }
                  placeholder={
                    formData.devEUIs.length === 0
                      ? "Select at least one device above"
                      : "Select a primary device"
                  }
                  required
                  className="machine-input"
                  size="xl"
                />

                <Button
                  loading={saveLoading}
                  type="submit"
                  fullWidth
                  disabled={!isValid}
                  className={`text-white ${
                    isValid ? "machine-valid-button" : "machine-invalid-button"
                  }`}
                  size="xl"
                >
                  {isNew ? "Create Machine" : "Save Machine"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
