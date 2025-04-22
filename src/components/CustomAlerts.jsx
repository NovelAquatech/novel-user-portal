import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Alert, Button, Input, Select } from "antd";
import { QueryBuilder } from "react-querybuilder";
import { QueryBuilderAntD } from "@react-querybuilder/antd";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { saveCustomAlert } from "../helper/web-service";
import styled from "styled-components";

const { Option } = Select;

const ClearfixDiv = styled.div`
  padding: 20px;
  overflow: auto;

  &::after {
    content: "";
    display: table;
    clear: both;
  }
`;

function CustomAlert({ type, message, description, onClose }) {
  return (
    <Alert
      message={message}
      description={description}
      type={type}
      showIcon
      closable
      onClose={onClose}
    />
  );
}

CustomAlert.propTypes = {
  type: PropTypes.oneOf(["success", "info", "warning", "error"]).isRequired,
  message: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClose: PropTypes.func,
};

CustomAlert.defaultProps = {
  description: "",
  onClose: () => { },
};

export default function CustomAlerts({ settings, setIsUpdated }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: "info",
    message: "",
    description: "",
  });

  const [selectedDevice, setSelectedDevice] = useState(settings[0]?.devEUI);
  const [inputValues, setInputValues] = useState(() =>
    settings.reduce((acc, setting) => {
      acc[setting.devEUI] = { filterName: "", guid: "" };
      return acc;
    }, {})
  );

  const [queries, setQueries] = useState(() =>
    settings.reduce((acc, setting) => {
      acc[setting.devEUI] = { combinator: "and", rules: [] };
      return acc;
    }, {})
  );

  const [autoLogin, setAutoLogin] = useState([]);

  const generateDynamicFields = (parameters) => {
    const operators = [
      { name: "=", label: "=" },
      { name: "!=", label: "!=" },
      { name: "<", label: "<" },
      { name: ">", label: ">" },
      { name: "<=", label: "<=" },
      { name: ">=", label: ">=" },
    ];

    return parameters.map((param) => ({
      name: param.parameter,
      label:
        param.paramDisplayName ||
        param.parameter.charAt(0).toUpperCase() +
        param.parameter.slice(1).replace(/_/g, " "),
      inputType: "number",
      operators,
    }));
  };

  useEffect(() => {
    setAutoLogin(user.autoLogin);
  }, [user]);

  const handleQueryChange = (devEUI, query) => {
    setQueries((prevQueries) => ({
      ...prevQueries,
      [devEUI]: query,
    }));
  };

  const postCustomAlertsForAllDevices = async () => {
    const deviceData = [];
    let isValid = true;
    const errors = {};

    const { filterName, notify } = inputValues[selectedDevice] || {};
    const selectedSetting = settings.find((s) => s.devEUI === selectedDevice);

    const currentQuery = queries[selectedDevice];
    if (!currentQuery.rules || currentQuery.rules.length === 0) {
      errors.queryRules = "At least one query rule is required";
      isValid = false;
    }

    if (!selectedSetting) {
      errors.device = "No device selected";
      isValid = false;
    }

    if (!isValid) {
      setCustomAlert({
        visible: true,
        type: "error",
        message: "Validation Failed",
        description: Object.values(errors).join(". "),
      });
      return;
    }

    const body = {
      devName: selectedSetting.devName,
      devEUI: selectedSetting.devEUI,
      guid: "",
      orgName: user.orgName,
      customFilterName: filterName || null,
      notify: notify|| false,
      filter: currentQuery,
    };

    deviceData.push(body);

    console.log("Data to be submitted:", deviceData);

    setLoading(true);
    const apiSaveUrl = saveCustomAlert(user);
    try {
      const response = await axios.post(apiSaveUrl, deviceData[0]);

      if (response.status === 200) {
        setCustomAlert({
          visible: true,
          type: "success",
          message: "Custom query created successfully!",
          description: "Custom alert filter has been saved.",
        });
        setIsUpdated(new Date().getTime());
      } else {
        throw new Error(response.statusText || "Error saving the filter.");
      }
    } catch (error) {
      console.error("Failed to post filter:", error);
      setCustomAlert({
        visible: true,
        type: "error",
        message: "Filter Post Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Unable to save the alert filter.",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedSetting = settings.find((s) => s.devEUI === selectedDevice);
  const deviceFields = generateDynamicFields(selectedSetting?.parameters ?? []);

  return (
    <div className="x_panel">
      <ClearfixDiv className="dbb">
        <div className="col-md-12 col-sm-12 col-xs-12">
          <div>
            <h4>
              <strong>Add Custom Alert</strong>
            </h4>
          </div>
        </div>
        <div className="col-md-12 col-sm-12 col-xs-12">
          <Select
          disabled={autoLogin}
            value={selectedDevice}
            onChange={setSelectedDevice}
            style={{ width: "100%", marginBottom: "20px" }}
            placeholder="Select a device"
          >
            {settings.map((setting) => (
              <Option key={setting.devEUI} value={setting.devEUI}>
                {setting.devName} - {setting.devEUI}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Enter Custom Alert Name (Optional)"
            value={inputValues[selectedDevice]?.filterName || ""}
            onChange={(e) =>
              setInputValues((prev) => ({
                ...prev,
                [selectedDevice]: {
                  ...prev[selectedDevice],
                  filterName: e.target.value,
                },
              }))
            }
            style={{ marginBottom: "15px", width: "100%" }}
          />
          <QueryBuilderAntD>
            <QueryBuilder
              fields={deviceFields}
              query={queries[selectedDevice]}
              onQueryChange={(query) =>
                handleQueryChange(selectedDevice, query)
              }
              disabled={autoLogin || !selectedDevice}
            />
          </QueryBuilderAntD>
          {customAlert.visible && (
            <CustomAlert
              type={customAlert.type}
              message={customAlert.message}
              description={customAlert.description}
              onClose={() => setCustomAlert({ ...customAlert, visible: false })}
            />
          )}
           <div className="form-check">
            <input
              disabled={autoLogin}
              checked={inputValues[selectedDevice]?.notify || false}
              type="checkbox"
              onChange={(e) => {
                const newChecked = e.target.checked;
                setInputValues((prev) => ({
                  ...prev,
                  [selectedDevice]: {
                    ...prev[selectedDevice],
                    notify: newChecked,
                  },
                }))
              }}
              style={{
                "width": "15px",
                "height": "15px"
              }}
            />
            <label className="form-check-label" style={{ "paddingLeft": "5px" }}>Notify</label>
          </div>
          <Button
            disabled={autoLogin}
            type="primary"
            onClick={postCustomAlertsForAllDevices}
            loading={loading}
            style={{ marginTop: "15px" }}
          >
            Submit
          </Button>
        </div>
      </ClearfixDiv>
    </div>
  );
}

CustomAlerts.propTypes = {
  settings: PropTypes.arrayOf(
    PropTypes.shape({
      devName: PropTypes.string.isRequired,
      devEUI: PropTypes.string.isRequired,
      parameters: PropTypes.arrayOf(
        PropTypes.shape({
          parameter: PropTypes.string.isRequired,
          paramDisplayName: PropTypes.string,
        })
      ).isRequired,
    })
  ).isRequired,
};
