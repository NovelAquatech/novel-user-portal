import { APP_CONST } from "./application-constant";
import moment from "moment";

const requestHeader = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function getRequest(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: requestHeader,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || `Unable to get response for status: ${response.status}`
      );
    }
    return data;
  } catch (error) {
    throw error;
  }
}

async function postRequest(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: requestHeader,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errData = await response.json();
      throw new Error(
        `Unable to getting response for HTTP status: ${response.status} and code : ${errData.error.code} and message : ${errData.error.message}`
      );
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function deleteRequest(url) {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: requestHeader,
    });
    if (!response.ok) {
      throw new Error(
        `Unable to process the request for status: ${response.status} and ${response.message}`
      );
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export const userLogin = (password) => {
  // For URL
  let url = `${
    import.meta.env.VITE_LOGIN_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_LOGIN_API_URL_SIG}`;
  // For Data
  let data = {};
  data.password = password;
  // Call end point
  return postRequest(url, data);
};

export const getDevices = (userInfo) => {
  // For URL
  let url = `${
    import.meta.env.VITE_DEVICE_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_DEVICE_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  // Call end point
  return getRequest(url);
};

// export const getSensorData = (userInfo, timeFilter = false) => {
//   let url = `${
//     import.meta.env.VITE_GET_SENSOR_API_URL
//   }/triggers/When_a_HTTP_request_is_received/paths/invoke`;

//   url = `${url}?api-version=${APP_CONST.API_VERSION}`;
//   url = `${url}&sp=${APP_CONST.SP}`;
//   url = `${url}&sv=${APP_CONST.SV}`;
//   url = `${url}&sig=${import.meta.env.VITE_GET_SENSOR_API_URL_SIG}`;
//   url = `${url}&orgName=${userInfo.orgName}`;
//   url = `${url}&authToken=${userInfo.token}`;

//   if (timeFilter) {
//     // Determine the date range based on timeFilter
//     const timeRanges = {
//       last_hour: moment().subtract(1, "hours"),
//       last_12_hour: moment().subtract(12, "hours"),
//       last_24_hour: moment().subtract(24, "hours"),
//       last_48_hour: moment().subtract(48, "hours"),
//       last_week: moment().subtract(1, "weeks"),
//       last_month: moment().subtract(1, "months"),
//       last_year: moment().subtract(1, "years"),
//     };

//     const dateStart = timeRanges[timeFilter]?.toISOString();
//     const dateEnd = moment().toISOString();

//     url = `${url}&dateStart=${dateStart}&dateEnd=${dateEnd}`;
//   }

//   // Call API endpoint
//   return getRequest(url);
// };

export const getSensorData = (
  userInfo,
  timeFilter = false,
  customFrom = null,
  customTo = null
) => {
  let url = `${
    import.meta.env.VITE_GET_SENSOR_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;

  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_SENSOR_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;

  const timeRanges = {
    last_hour: moment().subtract(1, "hours"),
    last_12_hour: moment().subtract(12, "hours"),
    last_24_hour: moment().subtract(24, "hours"),
    last_48_hour: moment().subtract(48, "hours"),
    last_week: moment().subtract(1, "weeks"),
    last_month: moment().subtract(1, "months"),
    last_year: moment().subtract(1, "years"),
  };

  let dateStart, dateEnd;

  if (timeFilter === "custom" && customFrom && customTo) {
    dateStart = moment(customFrom).startOf("day").toISOString();
    dateEnd = moment(customTo).endOf("day").toISOString();
  } else if (timeRanges[timeFilter]) {
    dateStart = timeRanges[timeFilter].toISOString();
    dateEnd = moment().toISOString();
  }

  if (dateStart && dateEnd) {
    url = `${url}&dateStart=${dateStart}&dateEnd=${dateEnd}`;
  }

  return getRequest(url);
};

export const getRainfallData = (userInfo, timeFilter = false) => {
  let url = `${
    import.meta.env.VITE_GET_SENSOR_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;

  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_SENSOR_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;

  // Determine date range based on timeframe
  if (timeFilter) {
    const timeRanges = {
      daily: moment().subtract(1, "hours"),
      weekly: moment().subtract(1, "weeks"),
      monthly: moment().subtract(1, "months"),
      yearly: moment().subtract(1, "years"),
    };

    const dateStart = timeRanges[timeFilter]?.toISOString();
    const dateEnd = moment().toISOString();

    url = `${url}&dateStart=${dateStart}&dateEnd=${dateEnd}`;
  }

  return getRequest(url);
};

export const getAdvisorySettingData = (userInfo) => {
  // For URL
  let url = `${
    import.meta.env.VITE_SET_ADV_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_SET_ADV_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed URL:", url); // Log the URL
  // Call end point
  return getRequest(url);
};

export const getParameters = (userInfo) => {
  let url = `${
    import.meta.env.VITE_GET_PARAM_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_PARAM_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed URL:", url); // Log the URL
  // Call end point
  return getRequest(url);
};

// src/helper/web-service.js
export const getAdvisorySettings = (userInfo) => {
  // For URL
  let url = `${
    import.meta.env.VITE_GET_ADV_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_ADV_API_URL_SIG}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed URL:", url);
  // Call end point
  return getRequest(url);
};

export const setAdvisorySettings = (userInfo) => {
  let url = `${
    import.meta.env.VITE_SET_ADV_SETTINGS_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_SET_ADV_SETTINGS_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed URL:", url); // Log the URL
  return url;
};

export const getMinMaxAdvisorySettings = (userInfo) => {
  let url = `${
    import.meta.env.VITE_GET_PARAM_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_PARAM_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed URL:", url); // Log the URL
  return url;
};

export const getValveSettings = (userInfo) => {
  let url = `${
    import.meta.env.VITE_GET_VALVE_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_VALVE_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Valve Settings URL:", url); // Log the URL
  return url;
};

export const setValveSettings = (userInfo) => {
  let url = `${
    import.meta.env.VITE_SET_VALVE_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_SET_VALVE_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Valve Settings URL:", url); // Log the URL
  return url;
};

export const saveCustomAlert = (userInfo) => {
  let url = `${
    import.meta.env.VITE_SET_CUSTOM_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_SET_CUSTOM_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Custom Alert Save URL:", url); // Log the URL
  return url;
};

export const getCustomAlertSettings = (userInfo) => {
  // For URL
  let url = `${
    import.meta.env.VITE_GET_CUSTOM_ALERT_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_CUSTOM_ALERT_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed URL:", url); // Log the URL
  // Call end point
  return getRequest(url);
};

export const getRules = (userInfo) => {
  // Construct the URL for fetching rules
  let url = `${
    import.meta.env.VITE_GET_RULES_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_RULES_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed Rules URL:", url); // Log the URL
  // Call the endpoint
  return getRequest(url);
};

export const updateCustomAlertSetting = (userInfo, customAlert) => {
  // Construct the URL for fetching rules
  let url = `${
    import.meta.env.VITE_SET_CUSTOM_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_SET_CUSTOM_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed Custom Alert URL:", url); // Log the URL
  // For Data
  let data = {
    orgName: userInfo.orgName,
    guid: customAlert.RowKey,
    notify: customAlert.notify,
    customFilterName: customAlert.customFilterName,
    devEUI: customAlert.devEUI,
    devName: customAlert.devName,
    filter: customAlert.filter,
  };

  // Call the endpoint
  return postRequest(url, data);
};

export const deleteCustomAlertSetting = (userInfo, rowKey) => {
  // Construct the URL for fetching rules
  let url = `${
    import.meta.env.VITE_DELETE_CUSTOM_ALERT_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_DELETE_CUSTOM_ALERT_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  url = `${url}&rowKey=${rowKey}`;
  console.log("Constructed Custom Alert URL:", url); // Log the URL
  // Call the endpoint
  return deleteRequest(url);
};

export const setDeviceEmail = (userInfo) => {
  let url = `${
    import.meta.env.VITE_SET_DEVICE_EMAIL_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_SET_DEVICE_EMAIL_API_URL_SIG}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed URL:", url); // Log the URL
  return url;
};

export const getAlerts = (userInfo) => {
  // For URL
  let url = `${
    import.meta.env.VITE_GET_ALERTS_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_ALERTS_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  url = `${url}&dateStart=${moment().subtract(1, "day").format("YYYY-MM-DD")}`;
  url = `${url}&dateEnd=${moment().format("YYYY-MM-DD")}`;
  console.log("Constructed URL:", url);
  // Call end point
  return getRequest(url);
};

export const getMachines = (userInfo) => {
  // For URL
  let url = `${
    import.meta.env.VITE_GET_MACHINE_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_MACHINES_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed URL:", url);
  // Call end point
  return getRequest(url);
};

export const setMachines = (userInfo) => {
  // Construct the URL for fetching rules
  let url = `${
    import.meta.env.VITE_SET_MACHINE_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_SET_MACHINE_API_URL_SIG}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed Record Monitor Data URL:", url); // Log the URL

  // Call the endpoint
  return url;
};

export const deleteMachines = (userInfo, rowKey, devEUIs, machineName) => {
  // Construct the URL for fetching rules
  let url = `${
    import.meta.env.VITE_DELETE_MACHINE_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_DELETE_MACHINE_API_URL_SIG}`;
  url = `${url}&authToken=${userInfo.token}`;
  url = `${url}&devEUIs=${devEUIs}`;
  url = `${url}&machineId=${rowKey}`;
  url = `${url}&machineName=${machineName}`;
  console.log("Constructed Record Monitor Data URL:", url);

  // Call the endpoint
  return getRequest(url);
};

export const updateValveSecondaryStatus = (userInfo, data) => {
  // Construct the URL for fetching rules
  let url = `${
    import.meta.env.VITE_MAKE_VALVE_SECONDARY_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_MAKE_VALVE_SECONDARY_API_URL_SIG}`;
  url = `${url}&orgName=${userInfo.orgName}`;
  url = `${url}&authToken=${userInfo.token}`;
  console.log("Constructed Custom Alert URL:", url);

  // Call the endpoint
  return postRequest(url, data);
};

export const getAverage=(userInfo,devEUIs)=>{
  let url =`${import.meta.env.VITE_GET_AVG}`;
  url = `${url}&authToken=${userInfo.token}`;
  url = `${url}&devEUIs=${JSON.stringify(devEUIs)}`;
  // console.log("Constructed average data URL:", url);
  return getRequest(url);
}
export const addDevice = (userInfo, devEUI) => {
  // Construct the URL for fetching rules
  let url = `${
    import.meta.env.VITE_GET_ADD_DEVICE_API_URL
  }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
  url = `${url}?api-version=${APP_CONST.API_VERSION}`;
  url = `${url}&sp=${APP_CONST.SP}`;
  url = `${url}&sv=${APP_CONST.SV}`;
  url = `${url}&sig=${import.meta.env.VITE_GET_ADD_DEVICE_API_URL_SIG}`;
  url = `${url}&authToken=${userInfo.token}`;
  url = `${url}&deviceEUI=${devEUI}`;

  console.log("Added device:", url);

  // Call the endpoint
  return getRequest(url);
};
