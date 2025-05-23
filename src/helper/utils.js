import { APP_CONST } from "../helper/application-constant";
import moment from "moment";
import mockCustomAlert from "./customAlertDummy.json";
export function differenceDate(date_past, date_now) {
  let date_past_time = date_past.getTime();
  let date_now_time = date_now.getTime();

  var delta = Math.abs(date_now_time - date_past_time) / 1000;

  // calculate (and subtract) whole days
  let days = Math.floor(delta / 86400);
  delta -= days * 86400;

  // calculate (and subtract) whole hours
  let hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  // calculate (and subtract) whole minutes
  let minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  // what's left is seconds
  let seconds = Math.floor(delta % 60);

  let diff = "";
  if (days > 0) {
    diff = `${days}D`;
  }
  if (hours > 0) {
    diff = `${diff} ${hours}H`;
  }
  if (minutes > 0) {
    diff = `${diff} ${minutes}M`;
  }
  if (seconds > 0) {
    diff = `${diff} ${seconds}S`;
  }
  return diff;
}

export const filterLatestAlerts = (data) => {
  // Create a map to group entries by parameter and func
  const latestEntries = data.reduce((acc, item) => {
    const { parameter, func, Timestamp } = item;

    if (!acc[parameter]) {
      acc[parameter] = { lt: null, gt: null };
    }

    if (func === "lt") {
      // Update the 'lt' entry if it's the latest one
      if (
        !acc[parameter].lt ||
        new Date(Timestamp) > new Date(acc[parameter].lt.Timestamp)
      ) {
        acc[parameter].lt = item;
      }
    } else if (func === "gt") {
      // Update the 'gt' entry if it's the latest one
      if (
        !acc[parameter].gt ||
        new Date(Timestamp) > new Date(acc[parameter].gt.Timestamp)
      ) {
        acc[parameter].gt = item;
      }
    }

    return acc;
  }, {});

  // Convert the result to an array if needed
  const filteredData = Object.values(latestEntries).flatMap(({ lt, gt }) =>
    [lt, gt].filter(Boolean)
  );

  return filteredData;
};

export const getOrganizedParameters = (data, isMachineParameters = false) => {
  const advisorySettings = data.reduce((acc, alert) => {
    let parameter = alert.parameter;
    if (parameter) {
      if (!acc[parameter]) {
        acc[parameter] = {
          parameter: parameter,
          paramDisplayName: alert.paramDisplayName ||
            alert.parameter.split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
          orgName: alert.orgName,
          currentMinAlert: alert.currentMinAlert,
          min_value: alert.min_value,
          currentMaxAlert: alert.currentMaxAlert,
          max_value: alert.max_value,
          unit: alert.unit,
          phaseVoltage: alert.phaseVoltage,
          powerFactor: alert.powerFactor,
          option: alert.option,
          active: alert.alertActive
        };
      }

      acc[parameter]["option"] = alert.option;
      if (acc[parameter]["min_value"] > alert.min_value) {
        acc[parameter]["min_value"] = alert.min_value;
      }

      if (acc[parameter]["currentMaxAlert"] > alert.currentMaxAlert) {
        acc[parameter]["currentMaxAlert"] = alert.currentMaxAlert;
      }

      if (acc[parameter]["max_value"] < alert.max_value) {
        acc[parameter]["max_value"] = alert.max_value;
      }

      if (acc[parameter]["currentMaxAlert"] < alert.currentMaxAlert) {
        acc[parameter]["currentMaxAlert"] = alert.currentMaxAlert;
      }

      if (acc[parameter]["phaseVoltage"] < alert.phaseVoltage) {
        acc[parameter]["phaseVoltage"] = alert.phaseVoltage;
      }

      if (acc[parameter]["powerFactor"] < alert.powerFactor) {
        acc[parameter]["powerFactor"] = alert.powerFactor;
      }
    }


    return acc;
  }, {});


  // If period_in and period_out parameteres is present then we add one more virtual people present parameter
  // that are derived from period in and period out parameters
  if (
    advisorySettings.hasOwnProperty("period_in") &&
    advisorySettings.hasOwnProperty("period_out")
  ) {
    advisorySettings["people_present"] = {
      parameter: "people_present",
      paramDisplayName: "People Present",
      orgName: data[0]["orgName"],
      currentMinAlert: 0,
      min_value: 0,
      currentMaxAlert: 0,
      max_value: 0,
      unit: "",
      active: false,
    };
  }

  return Object.fromEntries(
    Object.entries(advisorySettings).filter(([key]) => 
      isMachineParameters ? ["current", "power"].includes(key) : key !== "power"
    )
  );  
};

export const getOrganizedAdvisorySettings = (data) => {
  const organizedData = {};
  data.forEach((dt) => {
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
      unit: dt.unit,
    });
  });
  return organizedData;
};

export const getOrganizedSensorData = (data, parameters) => {
  let seriesData = {};
  let latestData = {};
  let dailyRainfall = 0;
  let dailyPeriodIn = 0;
  let dailyPeriodOut = 0;
  let cumulativePeriodIn = 0;
  let cumulativePeriodOut = 0;
  let currentDayRainfall = null;
  let currentDayPeoplepresent = null;
  let cumulativeDayPeoplepresent = null;
  let people_present = 0;
  let orgData = null;
  /* Organized sensor data device wise and calculate cumulative people present*/
  let organizedData = {};
  data.forEach((value) => {
    let devEUI = value.devEUI;
    let devName = value.devName;
    if (!organizedData[devEUI]) {
      organizedData[devEUI] = [];
    }
    organizedData[devEUI].push(value);

    /* Calculated cumulative people present */
    devEUI = APP_CONST.overAllPeoplePresentDevEUIKey;
    devName = APP_CONST.overAllPeoplePresentDevNameKey;
    let instData = {
      timestamp: value.Timestamp,
      devName: devEUI,
      devEUI: devName,
    };
    if (!seriesData[devEUI]) {
      seriesData[devEUI] = [];
    }
    let periodIn = value["period_in"] ?? null;
    let periodOut = value["period_out"] ?? null;
    if (periodIn != null || periodOut != null) {
      let day = moment(value.Timestamp).format("YYYY-MM-DD");
      if (day !== cumulativeDayPeoplepresent) {
        cumulativePeriodIn = 0;
        cumulativePeriodOut = 0;
        cumulativeDayPeoplepresent = day;
      }
      cumulativePeriodIn += periodIn;
      cumulativePeriodOut += periodOut;
      people_present = cumulativePeriodIn - cumulativePeriodOut;
      instData["people_present"] = people_present > 0 ? people_present : 0;
      seriesData[devEUI].push(instData);
    }
  });

  /* Now calculate series data and latest data */
  let timeBefore24Hour = moment().add(-24, "hours");
  Object.keys(organizedData).forEach((devEUI) => {
    orgData = organizedData[devEUI];
    dailyRainfall = 0;
    dailyPeriodIn = 0;
    dailyPeriodOut = 0;
    currentDayRainfall = null;
    currentDayPeoplepresent = null;

    orgData.forEach((value) => {
      let devName = value.devName;
      // For series data
      if (!seriesData[devEUI]) {
        seriesData[devEUI] = [];
      }
      // For last 24 hours data
      if (!latestData[devEUI]) {
        latestData[devEUI] = {};
      }

      let instData = {
        timestamp: value.Timestamp,
        devName: devName,
        devEUI: devEUI,
      };

      parameters.forEach((parameter) => {
        let fvalue = value[parameter] ?? null;
        switch (parameter) {
          case "rainfall_total":
            if (fvalue != null) {
              let day = moment(value.Timestamp).format("YYYY-MM-DD");
              if (day !== currentDayRainfall) {
                dailyRainfall = 0;
                currentDayRainfall = day;
              }
              dailyRainfall += fvalue;
              instData[parameter] = dailyRainfall;
              break;
            }
          case "people_present":
            let periodIn = value["period_in"] ?? null;
            let periodOut = value["period_out"] ?? null;
            if (periodIn != null || periodOut != null) {
              let day = moment(value.Timestamp).format("YYYY-MM-DD");
              if (day !== currentDayPeoplepresent) {
                dailyPeriodIn = 0;
                dailyPeriodOut = 0;
                currentDayPeoplepresent = day;
              }
              dailyPeriodIn += periodIn;
              dailyPeriodOut += periodOut;
              instData["people_present"] = dailyPeriodIn - dailyPeriodOut;
              // console.log(`############################`);
              // console.log(devEUI);
              // console.log(`currentDay =>${moment(value.Timestamp)}`);
              // console.log(`periodIn =>${periodIn} periodOut => ${periodOut}`);
              // console.log(`dailyPeriodIn => ${dailyPeriodIn}  dailyPeriodOut => ${dailyPeriodOut} people_present => ${instData["people_present"]}`);
              // console.log(`############################`);
            }
            break;
          default:
            instData[parameter] = fvalue;
            break;
        }
      });
      // Push into series data array
      seriesData[devEUI].push(instData);
      // Push into last 24 hours data
      let tm = moment(value.Timestamp);
      if (tm.diff(timeBefore24Hour, "seconds") > 0) {
        if (Object.keys(latestData[devEUI]) == 0) {
          latestData[devEUI] = instData;
        } else if (
          new Date(value.Timestamp) > new Date(latestData[devEUI].timestamp)
        ) {
          latestData[devEUI] = instData;
        }
      }
    });
  });

  return {
    seriesData: seriesData,
    latestData: latestData,
  };
};

export const getAlertAdvisories = (settings, last24HoursData) => {
  // Organized data
  let advisoriesData = [];
  Object.keys(settings).forEach((devEUI) => {
    let parameters = settings[devEUI];
    parameters.forEach((param) => {
      let {
        paramDisplayName,
        unit,
        currentMinAlert,
        currentMaxAlert,
        parameter,
        alertActive,
      } = param;
      if (typeof last24HoursData[devEUI] == "undefined" || !alertActive) {
        return true;
      }
      let curval = last24HoursData[devEUI][parameter];
      let devName = last24HoursData[devEUI]["devName"];
      const timestamp = last24HoursData[devEUI]["timestamp"];
      // For exceeded
      if (
        typeof currentMaxAlert != "undefined" &&
        currentMaxAlert &&
        curval != null &&
        curval > currentMaxAlert
      ) {
        let altdata = {
          devName: devName,
          parameter: parameter,
          name: paramDisplayName,
          unit: unit,
          value: curval,
          msg: `${devName} Has Breached ${capitalizeFirstLetter(
            parameter
          )} Threshold`,
          threshold: `<b>Threshold:</b> ${currentMaxAlert} ${unit}`,
          timeDiff: timeDifferenceFromNow(timestamp),
        };
        advisoriesData.push(altdata);
      }

      // For subceeded
      if (
        typeof currentMinAlert != "undefined" &&
        currentMinAlert &&
        curval != null &&
        curval < currentMinAlert
      ) {
        let altdata = {
          devName: devName,
          parameter: parameter,
          name: paramDisplayName,
          unit: unit,
          value: curval,
          msg: `${devName} Has Breached ${capitalizeFirstLetter(
            parameter
          )} Threshold`,
          threshold: `<b>Threshold:</b> ${currentMinAlert} ${unit ?? ""}`,
          timeDiff: timeDifferenceFromNow(timestamp),
        };
        advisoriesData.push(altdata);
      }
    });
  });

  return advisoriesData;
};

export const getAlerts = (alerts) => {
  const advisoriesData = [];

  const createAdvisoryData = (alert, thresholdValue) => ({
    devName: alert.devName,
    devEUI: alert.devEUI,
    parameter: alert.parameter,
    typeOfBreach: alert.typeOfBreach,
    name: alert.paramDisplayName,
    unit: alert?.unit ?? "",
    value: alert.currentValue,
    msg: `${alert.devName} Has Breached ${capitalizeFirstLetter(alert.parameter)} Threshold`,
    threshold: `${thresholdValue}${alert.unit ?? ""}`,
    timeDiff: timeDifferenceFromNow(alert.Timestamp),
  });

  alerts.forEach((alert) => {
    if (!alert || !alert.alertActive) return;

    const { currentMinAlert, currentMaxAlert, currentValue } = alert;

    if (currentValue != null) {
      if (currentMaxAlert != null && currentValue > currentMaxAlert)
        advisoriesData.push(createAdvisoryData(alert, currentMaxAlert));
      if (currentMinAlert != null && currentValue < currentMinAlert)
        advisoriesData.push(createAdvisoryData(alert, currentMinAlert));
    }
  });

  return advisoriesData;
};


export const getCustomAlertUtils = (
  customAlertSettings,
  last24HoursData,
  settings
) => {
  if (!customAlertSettings || !customAlertSettings.length) {
    customAlertSettings = mockCustomAlert;
  }
  const customAlerts = processAlerts(
    last24HoursData,
    customAlertSettings,
    settings
  );
  return customAlerts;
};

function evaluateRule(sensor, rule) {
  const { field, operator, value } = rule;
  const sensorValue = sensor[field];
  switch (operator) {
    case "=":
      return sensorValue === value;
    case ">":
      return sensorValue > value;
    case "<":
      return sensorValue < value;
    case ">=":
      return sensorValue >= value;
    case "<=":
      return sensorValue <= value;
    default:
      return false;
  }
}

function evaluateFilter(sensor, filter) {
  const { combinator, rules, not } = filter;
  const results = rules.map((rule) =>
    rule.rules
      ? evaluateFilter(sensor, rule) // Nested rules
      : evaluateRule(sensor, rule)
  );
  const result =
    combinator === "and" ? results.every(Boolean) : results.some(Boolean);
  return not ? !result : result;
}

function processAlerts(sensorData, alertRules, settings) {
  const matches = [];
  for (const rule of alertRules) {
    const filter = rule.filter;
    for (const devEUI in sensorData) {
      const sensor = sensorData[devEUI];
      if (sensor.devEUI === rule.devEUI && evaluateFilter(sensor, filter)) {
        const timestamp = sensorData[devEUI]["timestamp"];
        const params = settings[devEUI];
        const matchedValues = filter.rules
          .map((r) =>
            r.rules
              ? null
              : `${params.find((p) => p.parameter === r.field)
                ?.paramDisplayName || r.field
              }: ${sensor[r.field]} ${params.find((p) => p.parameter === r.field)?.unit || ""
              }`
          )
          .filter(Boolean) // Remove null values
          .join("<br />");

        let altdata = {
          devName: rule.devName,
          parameter: rule.query,
          name: "Custom",
          unit: "",
          value: matchedValues,
          msg: `Rule: ${capitalizeFirstLetter(
            convertOperator(rule.query)
          )} Threshold`,
          threshold: `<b>Combinator:</b> ${filter.combinator ? filter.combinator.toUpperCase() : ""
            }`,
          timeDiff: timeDifferenceFromNow(timestamp),
          customAlert: true,
        };
        matches.push(altdata);
      }
    }
  }
  return matches;
}

export const calculateAvgLatestData = (
  latestData,
  parameter,
  selectedDevices
) => {
  let total = 0,
    count = 0;
  Object.keys(latestData).forEach((devEUI) => {
    if (
      typeof latestData[devEUI][parameter] != "undefined" &&
      latestData[devEUI][parameter] != null &&
      selectedDevices.includes(devEUI)
    ) {
      total += latestData[devEUI][parameter];
      count += 1;
    }
  });
  return count > 0 ? total / count : 0;
};

export const calculateSumLatestData = (
  latestData,
  parameter,
  selectedDevices
) => {
  let total = 0;
  Object.keys(latestData).forEach((devEUI) => {
    if (
      typeof latestData[devEUI][parameter] != "undefined" &&
      latestData[devEUI][parameter] != null &&
      selectedDevices.includes(devEUI)
    ) {
      total += latestData[devEUI][parameter];
    }
  });
  return total;
};

export const getOrganizedDevicesAverage = (
  parameters,
  selectedDevices,
  last24HoursData
) => {
  const organizedData = [];
  Object.keys(parameters).forEach((key) => {
    let param = parameters[key];
    let {
      min_value,
      max_value,
      currentMinAlert,
      currentMaxAlert,
      parameter,
      paramDisplayName,
      unit,
    } = param;
    // Find low thohresld and high thohresld
    let low_thohresld = currentMinAlert
      ? currentMinAlert < min_value
        ? min_value
        : currentMinAlert
      : min_value;
    let high_thohresld = currentMaxAlert
      ? currentMaxAlert > max_value
        ? max_value * 0.7
        : currentMaxAlert
      : max_value * 0.7;

    let avg = 0;
    if (parameter == "people_present") {
      avg = calculateSumLatestData(last24HoursData, parameter, selectedDevices);
      avg = avg > 0 ? avg : 0;
    } else {
      avg = calculateAvgLatestData(last24HoursData, parameter, selectedDevices);
    }

    if (
      parameter != "people_present" &&
      !isValidatedAvgDevice(
        min_value,
        max_value,
        currentMinAlert,
        currentMaxAlert
      )
    ) {
      console.info(
        `[Utils][getOrganizedDevicesAverage] The ${parameter} is not considered for those value  min :${min_value} and max:${max_value} and low thohresld : ${low_thohresld} and high thohresld : ${high_thohresld}`
      );
      return;
    }
    organizedData.push({
      min_value,
      max_value,
      low_thohresld,
      high_thohresld,
      parameter,
      paramDisplayName,
      unit,
      avg,
    });
  });

  return organizedData;
};


export const isValidatedAvgDevice = (
  min_value,
  max_value,
  currentMinAlert,
  currentMaxAlert
) => {
  let flag = true;
  if (
    (typeof min_value == "undefined" && typeof max_value == "undefined") ||
    typeof max_value == "undefined"
  ) {
    flag = false;
  } else if (max_value <= min_value) {
    flag = false;
  } else if (min_value > currentMinAlert) {
    flag = false;
  } else if (max_value < currentMaxAlert) {
    flag = false;
  } else if (currentMinAlert > currentMaxAlert) {
    flag = false;
  } else if (currentMinAlert >= max_value) {
    flag = false;
  } else if (currentMaxAlert <= min_value) {
    flag = false;
  }
  return flag;
};

export const capitalizeFirstLetter = (word) => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const timeDifferenceFromNow = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now - past;

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hours ${minutes} minutes ago`;
  } else if (hours > 0) {
    return `${hours} hours ago`;
  } else {
    return `${minutes} minutes ago`;
  }
};

export const convertMsToKmh = (speedInMs) => {
  if (speedInMs == null || speedInMs === 0) {
    return 0; // Return 0 if speed is null or 0
  }
  return speedInMs * 3.6;
};

export const convertOperator = (str) => {
  if (str.includes(" lt ")) {
    str = str.replaceAll(" lt ", " < ");
  }
  if (str.includes(" gt ")) {
    str = str.replaceAll(" gt ", " > ");
  }
  if (str.includes(" eq ")) {
    str = str.replaceAll(" eq ", " = ");
  }
  if (str.includes(" ne ")) {
    str = str.replaceAll(" ne ", " != ");
  }
  if (str.includes(" le ")) {
    str = str.replaceAll(" le ", " <= ");
  }
  if (str.includes(" ge ")) {
    str = str.replaceAll(" ge ", " >= ");
  }
  return str;
};

export const organizedCustomAlertSetings = (customAlerts, devices) => {
  const organizedCustomAlertData = {};
  customAlerts.forEach((dt) => {
    let devEUI = dt.devEUI;
    if (!organizedCustomAlertData[devEUI]) {
      organizedCustomAlertData[devEUI] = [];
    }
    organizedCustomAlertData[devEUI].push({
      devEUI: dt.devEUI,
      devName: dt.devName,
      filter: dt.filter,
      query: dt.query,
      RowKey: dt.RowKey,
      customFilterName: dt.customFilterName,
      Timestamp: dt.Timestamp,
      notify: dt.notify || false
    });
  });
  const customAlertData = Object.entries(organizedCustomAlertData).map(
    ([devEUI, rules]) => {
      let devName = devices[devEUI];
      rules = rules.sort(function (x, y) {
        return (
          new Date(y.Timestamp).getTime() - new Date(x.Timestamp).getTime()
        );
      });
      return {
        devName,
        devEUI,
        rules,
      };
    }
  );
  return customAlertData;
};


export function limitingCharInStr(str, len) {
  if (str.length > len) {
    return str.substr(0, len) + "...";
  } else {
    return str;
  }
};

export function organizedExportedData(sensorData, selectedTimeframe, parameters, allowedDevices) {
  if (!sensorData || !Array.isArray(sensorData)) return null;

  // Define time range based on selected timeframe
  const timeRanges = {
    last_hour: moment().subtract(1, "hours"),
    last_12_hour: moment().subtract(12, "hours"),
    last_24_hour: moment().subtract(24, "hours"),
    last_48_hour: moment().subtract(48, "hours"),
    last_week: moment().subtract(1, "weeks"),
    last_month: moment().subtract(1, "months"),
    last_year: moment().subtract(1, "years"),
  };

  let pdt = timeRanges[selectedTimeframe] || moment().subtract(1, "hours"); // Default to last hour
  let { seriesData } = getOrganizedSensorData(sensorData, Object.keys(parameters)); // Organize data

  // Filter data based on allowed devices and selected time range
  const filteredData = Object.keys(seriesData)
    .filter(device => allowedDevices.includes(device))
    .reduce((result, device) => {
      let deviceData = seriesData[device].filter(dt => moment(dt.timestamp).isAfter(pdt));
      result[device] = deviceData.map(dt => ({
        ...dt,
        timestamp: moment(dt.timestamp).format("YYYY-MM-DD HH:mm:ss"),
      }));
      return result;
    }, {});

  return filteredData;
}

