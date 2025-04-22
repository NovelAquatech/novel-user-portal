import React, { useState, useEffect } from "react";
import { Checkbox } from "@mui/material";
import { CirclesWithBar } from "react-loader-spinner";
import { Navbar } from "../components/nav";
import { Footer } from "../components/footer";
import CustomAlerts from "../components/CustomAlerts";
import { useAuth } from "../hooks/useAuth";
import { useCacheStatus } from "../hooks/useCacheStatus";
import { toast, Toaster } from "react-hot-toast";
import {
    convertOperator,
    organizedCustomAlertSetings,
    getOrganizedAdvisorySettings
} from "../helper/utils";
import {
    getDevices,
    getCustomAlertSettings,
    getAdvisorySettings,
    updateCustomAlertSetting,
    deleteCustomAlertSetting
} from "../helper/web-service";
import styles from "./SettingPage.module.css";

export default function CustomSetting() {
    const { user } = useAuth();
    const { isDevicesFetched, setIsDevicesFetched, fetchedDevices, setFetchedDevices } = useCacheStatus();
    const [isLoaderVisible, setLoaderVisible] = useState(false);
    const [settings, setSettings] = useState([]);
    const [devices, setDevices] = useState([]);
    const [customAlertSettings, setCustomAlertSettings] = useState([]);
    const [autoLogin, setAutoLogin] = useState([]);
    const [isUpdated, setIsUpdated] = useState(null);
    const [isEligibleForSave, setIsEligibleForSave] = useState(false);
    const [isEligibleDevEUIForSave, setIsEligibleDevEUIForSave] = useState(false);
    const [isEligibleRowIdForSave, setIsEligibleRowIdForSave] =
        useState(false);

    useEffect(() => {
        // Showing loader
        setLoaderVisible(true);

        const apiPromises = [
            !isDevicesFetched ? getDevices(user) : Promise.resolve({ value: [] }), // Conditional call for getDevices
            getCustomAlertSettings(user),
            getAdvisorySettings(user),
        ];
        Promise.all(apiPromises).then(([devicesData, customAlertData, advisorySettingsData]) => {

            // Process Devices
            const deviceResponse = !isDevicesFetched ? devicesData?.["value"] || [] : fetchedDevices;
            if (!isDevicesFetched) setFetchedDevices(deviceResponse);
            const deviceList = deviceResponse.reduce((acc, device) => {
                acc[device.devEUI] = device.devName || null;
                return acc;
            }, {});
            setIsDevicesFetched(true);
            setDevices(deviceList);

            // Process Custom Alert Settings
            const customAlertResponse = customAlertData?.["value"] || [];
            const organizedCustomAlerts = organizedCustomAlertSetings(customAlertResponse, deviceList);
            setCustomAlertSettings(organizedCustomAlerts);

            // Process Advisory Settings
            const advisoryResponse = advisorySettingsData?.["value"] || [];
            const organizedAdvisorySettings = getOrganizedAdvisorySettings(advisoryResponse);
            const settingsData = Object.entries(organizedAdvisorySettings).map(
                ([devEUI, parameters]) => ({
                    devName: deviceList[devEUI],
                    devEUI,
                    parameters,
                })
            );
            setSettings(settingsData);

            // Set Auto Login
            setAutoLogin(user.autoLogin);

            // Hide loader
            setLoaderVisible(false);
        }).catch(error => {
            console.error("Error fetching data", error);
            setLoaderVisible(false);
        });
    }, [user]); // Depend on user to fetch data when it changes

    useEffect(() => {
        console.log("Handling save eligibility...");
        if (isEligibleForSave !== false) {
            const devEUI = isEligibleDevEUIForSave;
            const rowId = isEligibleRowIdForSave;
            setIsEligibleForSave(false);
            setIsEligibleRowIdForSave(false);
            setIsEligibleDevEUIForSave(false);
            handleSave(devEUI, rowId);
        }
    }, [isEligibleForSave]);


    const handleDelete = async (rowKey) => {
        console.log("[CustomSetting] inside handleDelete method");
        try {
            // Show loader
            setLoaderVisible(true);
            let delResponse = await deleteCustomAlertSetting(user, rowKey);
            if (delResponse.success) {
                toast.success("Custom alert deleted successfully!");
                setIsUpdated(new Date().getTime());
            } else {
                toast.success("Custom alert Deletion failed!");
                // hide loader
                setLoaderVisible(false);
            }
        } catch (err) {
            toast.error("Error occurred in time of custom alert deletion. Please try again.");
            setLoaderVisible(false);
        }

    }

    const handleSave = async (devEUI, rowKey) => {
        console.log("[CustomSetting] inside handleSave method");
        try {
            // Show loader
            setLoaderVisible(true);
            let selectedDevice = customAlertSettings.find((s) => s?.devEUI === devEUI);
            let selectedSetting = selectedDevice.rules.find(
                (s) => s?.RowKey === rowKey
            );
            console.log("selectedSetting :", selectedSetting);
            if (selectedSetting.length === 0) {
                toast.warn("No settings to save.");
                return;
            }
            await updateCustomAlertSetting(user, selectedSetting);
            toast.success("Settings saved successfully");
            // hide loader
            setLoaderVisible(false);
        } catch (err) {
            toast.error("Error saving settings. Please try again.");
            // hide loader
            setLoaderVisible(false);
        }

    }

    const updatedCustomAlertSettings = () => {
        customAlertSettings.forEach((settings) => {
            settings.rules.forEach((rule) => {
                if (rule.filter && rule.filter.combinator && rule.query) {
                    const combinator = rule.filter.combinator;
                    const updatedQuery = rule.query.replace(/\b(and|or)\b/g, combinator);
                    rule.query = updatedQuery;
                }
            });
        });
    };
    updatedCustomAlertSettings();


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
                    <div className="col-md-12 col-sm-12 col-xs-12 report">

                        <div className="x_panel">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                                <div className="ttl_main"><h2><strong>Custom Setting</strong></h2></div>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                                {settings.length > 0 && (
                                    <CustomAlerts
                                        settings={settings}
                                        setIsUpdated={setIsUpdated}
                                    />
                                )}
                            </div>
                            {customAlertSettings.length > 0 && (
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <h4 style={{ "marginLeft": "20px" }}>
                                        <strong>Custom Alerts List</strong>
                                    </h4>
                                    {customAlertSettings.map((customAlertSetting, index) => (
                                        <div className="x_panel" key={index}>
                                            <h5>
                                                <b>{customAlertSetting.devName} :</b> {customAlertSetting.devEUI}
                                            </h5>
                                            <div
                                                className={`chartbox dbb ${styles.tableContainer}`}
                                                style={{ marginTop: "10px", marginBottom: "30px" }}
                                            >
                                                <table className={`table table-striped table-bordered ${styles.table}`}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ textAlign: "center" }}>Alert Name</th>
                                                            <th style={{ textAlign: "center" }}>Rules</th>
                                                            <th style={{ textAlign: "center" }}>Notify</th>
                                                            <th style={{ textAlign: "center" }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {customAlertSetting.rules.map((rule, ind) => (
                                                            <tr key={ind}>
                                                                <td>{rule.customFilterName || "N/A"}</td>
                                                                <td>{convertOperator(rule.query) || ""}</td>
                                                                <td>
                                                                    <Checkbox
                                                                        disabled={autoLogin}
                                                                        checked={rule.notify}
                                                                        onChange={(e) => {
                                                                            const newChecked = e.target.checked;
                                                                            setCustomAlertSettings((prev) =>
                                                                                prev.map((s) => {
                                                                                    if (s.devEUI === customAlertSetting.devEUI) {
                                                                                        return {
                                                                                            ...s,
                                                                                            rules: s.rules.map(
                                                                                                (p) => {
                                                                                                    if (
                                                                                                        p.RowKey ===
                                                                                                        rule.RowKey
                                                                                                    ) {
                                                                                                        return {
                                                                                                            ...p,
                                                                                                            notify: newChecked,
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
                                                                            setIsEligibleDevEUIForSave(customAlertSetting.devEUI);
                                                                            setIsEligibleRowIdForSave(rule.RowKey);
                                                                            setIsEligibleForSave(true);

                                                                        }}
                                                                        color="primary"
                                                                        sx={{
                                                                            "& .MuiSvgIcon-root": { fontSize: 20 },
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        disabled={autoLogin}
                                                                        className="btn btn-primary btn-sm"
                                                                        onClick={(e) => {
                                                                            handleDelete(rule.RowKey);
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
