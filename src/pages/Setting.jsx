import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/nav';
import { Footer } from '../components/footer';
import { useAuth } from '../hooks/useAuth';
import { InputAdornment, OutlinedInput, Checkbox } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { useQuery } from 'react-query';
import axios from 'axios';
// import CustomAlerts from "../components/CustomAlerts";
import {
  setAdvisorySettings,
  getDevices,
  getAdvisorySettings,
} from '../helper/web-service';
import styles from './SettingPage.module.css';
import { toast, Toaster } from 'react-hot-toast';
import { CirclesWithBar } from 'react-loader-spinner';
import SwitchComponent from '../components/SwitchComponent';
import { useCacheStatus } from '../hooks/useCacheStatus';

export const SettingPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState([]);
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [showSuccMsg, setShowSuccMsg] = useState(false);
  const [showErrMsg, setShowErrMsg] = useState(false);
  const [isEligibleForSave, setIsEligibleForSave] = useState(false);
  const [isEligibleDevEUIForSave, setIsEligibleDevEUIForSave] = useState(false);
  const [isEligibleParameterForSave, setIsEligibleParameterForSave] =
    useState(false);
  const [errors, setErrors] = useState({});
  const [devices, setDevices] = useState([]);
  const [autoLogin, setAutoLogin] = useState(false);
  const {
    isDevicesFetched,
    setIsDevicesFetched,
    fetchedDevices,
    setFetchedDevices,
  } = useCacheStatus();
  // Fetch data inside the component
  const fetchAlertData = async () => {
    const apiPromises = [
      !isDevicesFetched ? getDevices(user) : Promise.resolve({ value: [] }), // Conditional call for getDevices
      getAdvisorySettings(user),
    ];
    const responses = await Promise.all(apiPromises);
    const devices = !isDevicesFetched ? responses[0]['value'] : fetchedDevices;
    if (!isDevicesFetched) setFetchedDevices(devices);
    setIsDevicesFetched(true);
    const advisorySettings = responses[1]['value'];
    return { devices, advisorySettings };
  };

  const { data, isLoading, error } = useQuery('alertData', fetchAlertData, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });

  // Update state when data is fetched
  useEffect(() => {
    setAutoLogin(user.autoLogin);
  }, []);
  useEffect(() => {
    if (data) {
      // Getting device list
      const deviceList = data.devices.reduce((acc, device) => {
        if (!acc[device.devEUI]) {
          acc[device.devEUI] = null;
        }
        acc[device.devEUI] = device.devName;
        return acc;
      }, {});
      setDevices(deviceList);

      // Getting organized the data
      const organizedData = {};
      data.advisorySettings.forEach((dt) => {
        let devEUI = dt.devEUI;
        if (!organizedData[devEUI]) {
          organizedData[devEUI] = [];
        }
        organizedData[devEUI].push({
          min_value: dt.min_value,
          max_value: dt.max_value,
          avg_value: dt.avg_value,
          currentMinAlert: dt.currentMinAlert,
          currentMaxAlert: dt.currentMaxAlert,
          alertActive: dt.alertActive,
          parameter: dt.parameter,
          orgName: dt.orgName,
          paramDisplayName: dt.paramDisplayName,
          repeatedAlert: dt.repeatedAlert,
        });
      });

      // Getting settings the data
      const settingsData = Object.entries(organizedData).map(
        ([devEUI, parameters]) => {
          let devName = deviceList[devEUI];
          return {
            devName,
            devEUI,
            parameters,
          };
        }
      );
      setSettings(settingsData);
    }
  }, [data, user]);

  // Validate the lt and gt values based on APP_CONST parameters
  const validateValues = (devEUI, parameterKey, field, value) => {
    const selectedDevice = settings.find((s) => s?.devEUI === devEUI);
    const selectedSetting = selectedDevice.parameters.find(
      (s) => s?.parameter === parameterKey
    );
    let isValid = true;
    let errorMsg = '';
    switch (field) {
      case 'currentMinAlert':
        if (value == selectedSetting.currentMinAlert) isValid = false;
        else if (selectedSetting?.min_value > value) {
          isValid = false;
          errorMsg = `Low Threshold should be more than or equal ${selectedSetting.min_value}`;
        }
        if (selectedSetting?.currentMaxAlert <= value) {
          isValid = false;
          errorMsg = `Low Threshold should be less than ${selectedSetting.currentMaxAlert}`;
        }
        break;
      case 'currentMaxAlert':
        if (value == selectedSetting.currentMaxAlert) isValid = false;
        else if (selectedSetting?.max_value < value) {
          isValid = false;
          errorMsg = `High Threshold should be less than or equal ${selectedSetting.max_value}`;
        }
        if (selectedSetting?.currentMinAlert >= value) {
          isValid = false;
          errorMsg = `High Threshold should be more than ${selectedSetting.currentMinAlert}`;
        }
        break;
      case 'min_value':
        if (value == selectedSetting.min_value) isValid = false;
        else if (selectedSetting?.currentMinAlert < value) {
          isValid = false;
          errorMsg = `Minimum value should be less than or equal ${selectedSetting.currentMinAlert}`;
        }
        break;
      case 'max_value':
        if (value == selectedSetting?.max_value) isValid = false;
        else if (selectedSetting?.currentMaxAlert > value) {
          isValid = false;
          errorMsg = `Maximum value should be more than or equal to ${selectedSetting.currentMaxAlert}`;
        }
        break;
      default:
        isValid = true;
        errorMsg = '';
    }
    return { isValid, errorMsg };
  };

  const handleSave = async (isLoaderVisible = true, devEUI, parameter) => {
    if (isLoaderVisible) setLoaderVisible(true);
    const apiSaveUrl = setAdvisorySettings(user);
    try {
      let selectedDevice = settings.find((s) => s?.devEUI === devEUI);
      let selectedSetting = selectedDevice.parameters.find(
        (s) => s?.parameter === parameter
      );
      selectedSetting = { ...selectedSetting, devEUI: devEUI };
      console.log('selectedSetting :', selectedSetting);
      if (selectedSetting.length === 0) {
        toast.warn('No settings to save.');
        return;
      }
      await axios.post(apiSaveUrl, selectedSetting);
      toast.success('Settings saved successfully!');
      setShowSuccMsg(true);
      setLoaderVisible(false);
    } catch (err) {
      toast.error('Error saving settings. Please try again.');
      setShowErrMsg(true);
      setLoaderVisible(false);
    }
  };

  // Auto-save on blur
  const handleBlur = async (devEUI, parameter, field, value) => {
    console.log('Hello World', { devEUI, parameter, field, value });
    const { isValid, errorMsg } = validateValues(
      devEUI,
      parameter,
      field,
      value
    );
    if (isValid) {
      const updatedSettings = settings.map((s) => {
        if (s.devEUI === devEUI) {
          s.parameters.map((p) => {
            if (p.parameter === parameter) {
              p[field] = Number(value);
            }
            return p;
          });
        }
        return s;
      });
      setSettings(updatedSettings);
      setErrors((prev) => ({ ...prev, [`${parameter}_${field}`]: false }));
      setIsEligibleDevEUIForSave(devEUI);
      setIsEligibleParameterForSave(parameter);
      setIsEligibleForSave(true);
    } else if (errorMsg) {
      toast.error(errorMsg);
      setErrors((prev) => ({ ...prev, [`${parameter}_${field}`]: true }));
      // TODO: Re-render the form with its original values
    }
  };

  useEffect(() => {
    setLoaderVisible(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (isEligibleForSave !== false) {
      let devEUI = isEligibleDevEUIForSave;
      let parameter = isEligibleParameterForSave;
      setIsEligibleForSave(false);
      setIsEligibleParameterForSave(false);
      setIsEligibleDevEUIForSave(false);
      handleSave(false, devEUI, parameter);
    }
  }, [isEligibleForSave, isEligibleDevEUIForSave, isEligibleParameterForSave]);

  useEffect(() => {
    setTimeout(() => {
      if (showSuccMsg || showErrMsg) {
        setShowErrMsg(false);
        setShowSuccMsg(false);
      }
    }, 5000);
  }, [showSuccMsg, showErrMsg]);

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
          <div className="col-md-12 col-sm-12 col-xs-12" id="style-3">
            <div className="x_panel">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div
                  className={
                    user.orgName == 'UNSW' || user.orgName == 'UNSW2'
                      ? 'ttl_main sm-padding'
                      : 'ttl_main'
                  }
                >
                  <h2 style={{ textAlign: 'center' }}>
                    <strong
                      className={
                        user.orgName == 'SeelyEnergyMonitor'
                          ? 'show-elm'
                          : 'hide-elm'
                      }
                    >
                      Seeley Energy Monitor
                    </strong>
                  </h2>
                </div>

                <SwitchComponent devices={devices} autoLogin={autoLogin} />
                <div
                  className={
                    user.orgName == 'UNSW' || user.orgName == 'UNSW2'
                      ? 'ttl_main sm-padding'
                      : 'ttl_main'
                  }
                >
                  <h2>
                    <strong>Advisory Setting</strong>
                  </h2>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="centerwrapperbox">
                    <h2 className="dev_ttlmain"> </h2>
                  </div>
                </div>
              </div>
              <div>
                {settings.map((setting, index) => (
                  <div key={index}>
                    <h5>
                      <b>{setting.devName} :</b> {setting.devEUI}
                    </h5>
                    <div
                      className={`chartbox dbb ${styles.tableContainer}`}
                      style={{ marginTop: '10px', marginBottom: '30px' }}
                    >
                      <table
                        id="datatable"
                        className={`table table-striped table-bordered ${styles.table}`}
                      >
                        <thead>
                          <tr>
                            <th
                              className={`${styles.stickyColumn1}`}
                              style={{ textAlign: 'center' }}
                            >
                              Active
                            </th>
                            <th
                              className={`${styles.stickyColumn2}`}
                              style={{ textAlign: 'center' }}
                            >
                              Alert
                            </th>
                            <th style={{ textAlign: 'center' }}>Minimum</th>
                            <th style={{ textAlign: 'center' }}>
                              Low Threshold
                            </th>
                            <th style={{ textAlign: 'center' }}>
                              High Threshold
                            </th>
                            <th style={{ textAlign: 'center' }}>Maximum</th>
                            <th style={{ textAlign: 'center' }}>Notify</th>
                          </tr>
                        </thead>
                        <tbody>
                          {setting.parameters
                            .filter((param) => {
                              if (setting.devName === 'Control2') {
                                return (
                                  param.paramDisplayName !== 'Gpio 1' &&
                                  param.paramDisplayName !== 'Gpio 2'
                                );
                              }
                              return true;
                            })
                            .map((param, index) => (
                              <tr key={index}>
                                <td className={`${styles.stickyColumn1}`}>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      disabled={autoLogin}
                                      checked={param.alertActive}
                                      onChange={(e) => {
                                        setSettings((prev) => {
                                          prev.map((s) => {
                                            if (s.devEUI === setting.devEUI) {
                                              s.parameters.map((p) => {
                                                if (
                                                  p.parameter ===
                                                  param.parameter
                                                ) {
                                                  p.alertActive =
                                                    e.target.checked;
                                                }
                                                return p;
                                              });
                                            }
                                            return s;
                                          });
                                          return prev;
                                        });
                                        setIsEligibleDevEUIForSave(
                                          setting.devEUI
                                        );
                                        setIsEligibleParameterForSave(
                                          param.parameter
                                        );
                                        setIsEligibleForSave(true);
                                      }}
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </td>
                                <td className={`${styles.stickyColumn2}`}>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      whiteSpace: 'normal',
                                      wordWrap: 'break-word',
                                    }}
                                  >
                                    {param.paramDisplayName}
                                  </span>
                                  <input
                                    type="hidden"
                                    value={param.parameter}
                                  />
                                </td>
                                <td className={styles.settings_input}>
                                  {/* {param.parameter === "leakage_status" ? (
                                  <div className={styles.switch_container}>
                                    <span>OFF</span>
                                    <label className="switch">
                                      <input
                                        type="checkbox"
                                        checked={
                                          param.min_value > 0 &&
                                          param.max_value > 0
                                        }
                                        onChange={(e) => {
                                          setSettings((prev) => {
                                            prev.map((s) => {
                                              if (s.devEUI === setting.devEUI) {
                                                s.parameters.map((p) => {
                                                  if (
                                                    p.parameter ===
                                                    param.parameter
                                                  ) {
                                                    p.min_value = e.target
                                                      .checked
                                                      ? 1
                                                      : 0;
                                                    p.max_value = e.target
                                                      .checked
                                                      ? 1
                                                      : 0;
                                                  }
                                                  return p;
                                                });
                                              }
                                              return s;
                                            });
                                            return prev;
                                          });
                                          setIsEligibleDevEUIForSave(
                                            setting.devEUI
                                          );
                                          setIsEligibleParameterForSave(
                                            param.parameter
                                          );
                                          setIsEligibleForSave(true);
                                        }}
                                      />
                                      <span className="slider round"></span>
                                    </label>
                                    <span>ON</span>
                                  </div>
                                ) : ( */}
                                  <OutlinedInput
                                    startAdornment={
                                      <InputAdornment position="start">
                                        <ErrorOutline
                                          style={{ color: 'red' }}
                                        />
                                      </InputAdornment>
                                    }
                                    defaultValue={param.min_value}
                                    onBlur={(e) =>
                                      handleBlur(
                                        setting.devEUI,
                                        param.parameter,
                                        'min_value',
                                        e.target.value
                                      )
                                    }
                                    disabled={!param.alertActive || autoLogin}
                                    error={
                                      errors[`${param.parameter}_min_value`] ||
                                      false
                                    }
                                    style={{
                                      borderColor: errors[
                                        `${param.parameter}_min_value`
                                      ]
                                        ? 'red'
                                        : '',
                                      borderWidth: errors[
                                        `${param.parameter}_min_value`
                                      ]
                                        ? '2px'
                                        : '',
                                    }}
                                    aria-describedby="outlined-weight-helper-text"
                                  />
                                  {/* )} */}
                                </td>
                                <td className={styles.settings_input}>
                                  {/* {param.parameter !== "leakage_status" ? ( */}
                                  <OutlinedInput
                                    startAdornment={
                                      <InputAdornment position="start">
                                        <ErrorOutline
                                          style={{ color: 'red' }}
                                        />
                                      </InputAdornment>
                                    }
                                    defaultValue={param.currentMinAlert}
                                    onBlur={(e) =>
                                      handleBlur(
                                        setting.devEUI,
                                        param.parameter,
                                        'currentMinAlert',
                                        e.target.value
                                      )
                                    }
                                    disabled={!param.alertActive || autoLogin}
                                    error={
                                      errors[
                                        `${param.parameter}_currentMinAlert`
                                      ] || false
                                    }
                                    style={{
                                      borderColor: errors[
                                        `${param.parameter}_currentMinAlert`
                                      ]
                                        ? 'red'
                                        : '',
                                      borderWidth: errors[
                                        `${param.parameter}_currentMinAlert`
                                      ]
                                        ? '2px'
                                        : '',
                                    }}
                                    aria-describedby="outlined-weight-helper-text"
                                  />
                                  {/* ) : (
                                  ""
                                )} */}
                                </td>
                                <td className={styles.settings_input}>
                                  {/* {param.parameter !== "leakage_status" ? ( */}
                                  <OutlinedInput
                                    startAdornment={
                                      <InputAdornment position="start">
                                        <ErrorOutline
                                          style={{ color: 'red' }}
                                        />
                                      </InputAdornment>
                                    }
                                    defaultValue={param.currentMaxAlert}
                                    onBlur={(e) =>
                                      handleBlur(
                                        setting.devEUI,
                                        param.parameter,
                                        'currentMaxAlert',
                                        e.target.value
                                      )
                                    }
                                    disabled={!param.alertActive || autoLogin}
                                    error={
                                      errors[
                                        `${param.parameter}_currentMaxAlert`
                                      ] || false
                                    }
                                    style={{
                                      borderColor: errors[
                                        `${param.parameter}_currentMaxAlert`
                                      ]
                                        ? 'red'
                                        : '',
                                      borderWidth: errors[
                                        `${param.parameter}_currentMaxAlert`
                                      ]
                                        ? '2px'
                                        : '',
                                    }}
                                    aria-describedby="outlined-weight-helper-text"
                                  />
                                  {/* ) : (
                                  ""
                                )} */}
                                </td>
                                <td className={styles.settings_input}>
                                  {/* {param.parameter !== "leakage_status" ? ( */}
                                  <OutlinedInput
                                    startAdornment={
                                      <InputAdornment position="start">
                                        <ErrorOutline
                                          style={{ color: 'red' }}
                                        />
                                      </InputAdornment>
                                    }
                                    defaultValue={param.max_value}
                                    onBlur={(e) =>
                                      handleBlur(
                                        setting.devEUI,
                                        param.parameter,
                                        'max_value',
                                        e.target.value
                                      )
                                    }
                                    disabled={!param.alertActive || autoLogin}
                                    error={
                                      errors[`${param.parameter}_max_value`] ||
                                      false
                                    }
                                    style={{
                                      borderColor: errors[
                                        `${param.parameter}_max_value`
                                      ]
                                        ? 'red'
                                        : '',
                                      borderWidth: errors[
                                        `${param.parameter}_max_value`
                                      ]
                                        ? '2px'
                                        : '',
                                    }}
                                    aria-describedby="outlined-weight-helper-text"
                                  />
                                  {/* ) : (
                                  ""
                                )} */}
                                </td>
                                <td>
                                  <Checkbox
                                    disabled={autoLogin}
                                    checked={param?.repeatedAlert}
                                    onChange={(e) => {
                                      const newChecked = e.target.checked;
                                      setSettings((prev) =>
                                        prev.map((s) => {
                                          if (s.devEUI === setting.devEUI) {
                                            return {
                                              ...s,
                                              parameters: s.parameters.map(
                                                (p) => {
                                                  if (
                                                    p.parameter ===
                                                    param.parameter
                                                  ) {
                                                    return {
                                                      ...p,
                                                      repeatedAlert: newChecked,
                                                    };
                                                  }
                                                  return p;
                                                }
                                              ),
                                            };
                                          }
                                          return s;
                                        })
                                      );
                                      setIsEligibleDevEUIForSave(
                                        setting.devEUI
                                      );
                                      setIsEligibleParameterForSave(
                                        param.parameter
                                      );
                                      setIsEligibleForSave(true);
                                    }}
                                    color="primary"
                                    sx={{
                                      '& .MuiSvgIcon-root': { fontSize: 20 },
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
