import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  userLogin,
  getDevices,
  getSensorData,
  getAdvisorySettings,
  getValveSettings,
  getCustomAlertSettings,getAlerts,getMachines
} from "../web-service.js";
import { sha512 } from "js-sha512";

let user = null;
const password = "$seelyEnergy83925";

describe("Integration test with real backend", () => {
  beforeAll(async () => {
    try {
      const hashedPassword = sha512(password);
      const loginResponse = await userLogin(hashedPassword);
      //   console.log("Login response:", loginResponse);
      user = loginResponse;

      if (!user?.token) throw new Error("Login failed, no token returned");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  });

  it("fetches devices for the organization", async () => {
    const userInfo = { orgName: user.orgName, token: user.token };
    const devicesResponse = await getDevices(userInfo);
    // console.log("Devices API returned:", devicesResponse);

    expect(devicesResponse).toBeDefined();
    expect(Array.isArray(devicesResponse.value)).toBe(true);

    if (devicesResponse.value.length > 0) {
      expect(devicesResponse.value[0]).toHaveProperty("devEUI");
      expect(devicesResponse.value[0]).toHaveProperty("devName");
      expect(devicesResponse.value[0]).toHaveProperty("orgName");
    }
  });

  it("fetches sensors for the organization", async () => {
    const userInfo = { orgName: user.orgName, token: user.token };
    const timeFilter = "last_week";
    const sensorsResponse = await getSensorData(userInfo, timeFilter);
    // console.log("Sensors API returned:", sensorsResponse);

    expect(sensorsResponse).toBeDefined();
    expect(Array.isArray(sensorsResponse.value)).toBe(true);

    if (sensorsResponse.value.length > 0) {
      expect(sensorsResponse.value[0]).toHaveProperty("devEUI");
      expect(sensorsResponse.value[0]).toHaveProperty("Timestamp");
    }
  });

  it("fetches Advisory Setting for the organization", async () => {
    const userInfo = { orgName: user.orgName, token: user.token };
    const parameter = "battery";
    const advisorySetting = await getAdvisorySettings(userInfo, parameter);
    // console.log("Advisory Settings API returned:", advisorySetting);

    expect(advisorySetting).toBeDefined();
    expect(Array.isArray(advisorySetting.value)).toBe(true);

    if (advisorySetting.value.length > 0) {
      expect(advisorySetting.value[0]).toHaveProperty("devEUI");
      expect(advisorySetting.value[0]).toHaveProperty("parameter");
    }
  });

  it("fetches Valve setting for the organizations", async () => {
    const userInfo = { orgName: user.orgName, token: user.token };
    const valveSettings = getValveSettings(userInfo);
    console.log("Valve Settings API returned:", valveSettings);

    expect(valveSettings).toBeDefined();
    // expect(Array.isArray(valveSettings)).toBe(true);
  });

  it("fetches custom alert settings for the organization", async () => {
    const userInfo = { orgName: user.orgName, token: user.token };
    const customAlertSettings = await getCustomAlertSettings(userInfo);
    // console.log("Custom Alert Settings API returned:", customAlertSettings);

    expect(customAlertSettings).toBeDefined();
    expect(Array.isArray(customAlertSettings.value)).toBe(true);

    if (customAlertSettings.value.length > 0) {
      expect(customAlertSettings.value[0]).toHaveProperty("devEUI");
      expect(customAlertSettings.value[0]).toHaveProperty("alertType");
      expect(customAlertSettings.value[0]).toHaveProperty("threshold");
    }
  });
    it("fetches alerts for the organization", async () => {
    const userInfo = { orgName: user.orgName, token: user.token };
    const alerts = await getAlerts(userInfo);
    console.log("Alerts API returned:", alerts);
    expect(alerts).toBeDefined();
    expect(Array.isArray(alerts.value)).toBe(true);

    if (alerts.value.length > 0) {
      expect(alerts.value[0]).toHaveProperty("devEUI");
 
    }
  });
    it("fetches machines for the organization", async () => {
    const userInfo = { orgName: user.orgName, token: user.token };
    const machines = await getMachines(userInfo);
    // console.log("Machines API returned:", machines);

    expect(machines).toBeDefined();
    expect(Array.isArray(machines.value)).toBe(true);

    if (machines.value.length > 0) {
      expect(machines.value[0]).toHaveProperty("primaryDevEUI");
      expect(machines.value[0]).toHaveProperty("machineName");
      expect(machines.value[0]).toHaveProperty("orgName");
    }
})
  });
