import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "react-query";
import SwitchComponent from "../SwitchComponent";
import { AuthProvider } from "../../hooks/useAuth";
import { MemoryRouter } from "react-router-dom";
import dayjs from "dayjs";
import userEvent from "@testing-library/user-event";

vi.mock("axios");

// 🔹 Utility: sequence mocking
export function mockAxiosSequence(responses) {
  let callCount = 0;
  axios.get.mockImplementation(() => {
    if (callCount < responses.length) {
      return Promise.resolve(responses[callCount++]);
    }
    return Promise.resolve(responses[responses.length - 1]);
  });
}

// 🔹 Utility: factories
function makeValve({
  id,
  devEUI,
  identifier,
  isSecondary = false,
  active = false,
  once = false,
  manual = false,
}) {
  return {
    RowKey: id,
    devEUI,
    identifier,
    PartitionKey: "DeepTesting",
    isSecondary,
    once,
    repeat: false,
    manual,
    active,
    turnOnTime: "2025-09-25T21:55:00",
    turnOffTime: "2025-09-25T23:15:00",
  };
}

function statusResponse(rowKey, status, synced = true) {
  return { rowKey, currentStatus: status, synced };
}

// 🔹 Utility: render wrapper
function renderWithClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchInterval: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

async function setupSwitchComponent(responses) {
  mockAxiosSequence(responses);
  renderWithClient(
    <MemoryRouter>
      <AuthProvider>
        <SwitchComponent devices={mockDevices} />
      </AuthProvider>
    </MemoryRouter>
  );
  await screen.findByText(/Device Settings/i);
}

const mockDevices = {
  "24e124460d323974": "Device A",
  "24e124460e222845": "Device B",
};

beforeEach(() => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      orgName: "DeepTesting",
      token: "NjI3MzYxNTIzMjAyNS0wOS0yNVQxNTo0Mjo0OC4zMTEyMzUyWg==",
    })
  );
});
afterEach(() => {
  localStorage.clear();
});

describe("SwitchComponent integration", () => {
  it("should deactivate High pressure valve in once mode if at least one low pressure is not active", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              once: true,
              active: true,
              isSecondary: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: false,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              once: false,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", true),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              once: true,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: false,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              once: false,
              active: false,
            }),
          ],
        },
      },
    ]);
    const primarySwitch = await screen.findByTestId("active-24e124460d323974");
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () => {
        const updatedSwitch = screen.getByTestId("active-24e124460d323974");
        // console.log("Checkbox checked state:", updatedSwitch.checked);
        expect(updatedSwitch.checked).toBeFalsy();
      },
      { timeout: 10000 }
    );
  });
  it("should activate High pressure valve in repeat mode if one low pressure is active", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              once: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: true,
              active: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              once: false,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", true),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              once: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              active: true,
              once: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              once: false,
              active: false,
            }),
          ],
        },
      },
    ]);

    const primarySwitch = await screen.findByTestId("active-24e124460d323974");
    // console.log("Checkbox checked state:", primarySwitch.checked);
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () => {
        const updatedSwitch = screen.getByTestId("active-24e124460d323974");
        // console.log("Checkbox checked state:", updatedSwitch.checked);
        expect(updatedSwitch.checked).toBeTruthy();
      },
      { timeout: 10000 }
    );
  });
  it("should deactivate Low pressure valve in once mode if at least one low pressure is not active", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              once: false,
              active: false,
              isSecondary: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: false,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              once: true,
              active: true,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", true),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              once: false,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: false,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              once: true,
              active: false,
            }),
          ],
        },
      },
    ]);

    //     // ✅ Primary starts active
    const primarySwitch = await screen.findByTestId("active-24e124460e222845");
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () => {
        const updatedSwitch = screen.getByTestId("active-24e124460e222845");
        // console.log("Checkbox checked state:", updatedSwitch.checked);
        expect(updatedSwitch.checked).toBeFalsy();
      },
      { timeout: 10000 }
    );
  });
  it("should activate Low pressure valve in once mode if at least one low pressure is already active", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              once: false,
              active: false,
              isSecondary: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: true,
              active: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              once: true,
              active: true,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", true),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", true),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              once: false,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: true,
              active: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              once: true,
              active: true,
            }),
          ],
        },
      },
    ]);

    //     // ✅ Primary starts active
    const primarySwitch = await screen.findByTestId("active-24e124460e222845");
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () => {
        const updatedSwitch = screen.getByTestId("active-24e124460e222845");
        // console.log("Checkbox checked state:", updatedSwitch.checked);
        expect(updatedSwitch.checked).toBeTruthy();
      },
      { timeout: 10000 }
    );
  });
  it("should deactivate High pressure valve in repeat mode if at least not one low pressure is active", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              repeat: true,
              active: true,
              isSecondary: false,
              turnOnTime: "00:00:00",
              turnOffTime: "00:02:00",
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              repeat: false,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              repeat: false,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", true),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              repeat: true,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              repeat: false,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              repeat: false,
              active: false,
            }),
          ],
        },
      },
    ]);

    //     // ✅ Primary starts active
    const primarySwitch = await screen.findByTestId("active-24e124460d323974");
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () => {
        const updatedSwitch = screen.getByTestId("active-24e124460d323974");
        // console.log("Checkbox checked state:", updatedSwitch.checked);
        expect(updatedSwitch.checked).toBeFalsy();
      },
      { timeout: 10000 }
    );
  });
  it("should activate High pressure valve in repeat mode if one low pressure is active", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              repeat: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              repeat: true,
              active: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              repeat: false,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", true),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", true),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              repeat: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              active: true,
              repeat: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              repeat: false,
              active: false,
            }),
          ],
        },
      },
    ]);

    const primarySwitch = await screen.findByTestId("active-24e124460d323974");
    // console.log("Checkbox checked state:", primarySwitch.checked);
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () => {
        const updatedSwitch = screen.getByTestId("active-24e124460d323974");
        // console.log("Checkbox checked state:", updatedSwitch.checked);
        expect(updatedSwitch.checked).toBeTruthy();
      },
      { timeout: 10000 }
    );
  });
  it("should deactivate Low pressure valve in repeat mode if at least one low pressure is not active", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              repeat: false,
              active: false,
              isSecondary: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              repeat: false,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              repeat: true,
              active: true,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", true),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              repeat: false,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              repeat: false,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              repeat: true,
              active: false,
            }),
          ],
        },
      },
    ]);

    const primarySwitch = await screen.findByTestId("active-24e124460e222845");
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () => {
        const updatedSwitch = screen.getByTestId("active-24e124460e222845");
        // console.log("Checkbox checked state:", updatedSwitch.checked);
        expect(updatedSwitch.checked).toBeFalsy();
      },
      { timeout: 10000 }
    );
  });
  it("should activate Low pressure valve in repeat mode if at least one low pressure is already active", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              repeat: false,
              active: false,
              isSecondary: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              repeat: true,
              active: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              repeat: true,
              active: true,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", true),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", true),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              repeat: false,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              repeat: true,
              active: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              repeat: true,
              active: true,
            }),
          ],
        },
      },
    ]);
    const secondarySwitch = await screen.findByTestId(
      "active-24e124460e222845"
    );
    expect(secondarySwitch.checked).toBeTruthy();

    await waitFor(
      () => {
        const updatedSwitch = screen.getByTestId("active-24e124460e222845");
        // console.log("Checkbox checked state:", updatedSwitch.checked);
        expect(updatedSwitch.checked).toBeTruthy();
      },
      { timeout: 10000 }
    );
  });
  it("should not activate High pressure valve when in manual mode and low-pressure valves are off", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              manual: true,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              manual: true,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings (still off)
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              active: false,
              manual: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              active: false,
              manual: true,
            }),
          ],
        },
      },
    ]);

    // ✅ Ensure primary starts off
    const primarySwitch = await screen.findByTestId("active-24e124460d323974");
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () =>
        expect(
          screen.getByTestId("active-24e124460d323974").checked
        ).toBeFalsy(),
      { timeout: 10000 }
    );
  });
  it("should activate High pressure valve when in manual mode and low-pressure valves are on", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              manual: true,
              active: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              manual: true,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", true),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", true),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              active: true,
              manual: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              active: false,
              manual: true,
            }),
          ],
        },
      },
    ]);

    // ✅ Ensure primary starts off
    const primarySwitch = await screen.findByTestId("active-24e124460d323974");
    expect(primarySwitch.checked).toBeTruthy();

    await waitFor(
      () =>
        expect(
          screen.getByTestId("active-24e124460d323974").checked
        ).toBeTruthy(),
      { timeout: 10000 }
    );
  });
  it("user can activate low pressure valve when in manual mode", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              manual: true,
              active: false,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              manual: true,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              active: true,
              manual: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              active: false,
              manual: true,
            }),
          ],
        },
      },
    ]);

    // ✅ Ensure primary starts off
    const primarySwitch = await screen.findByTestId(
      "active-24e124460d323974_valve_2"
    );
    fireEvent.click(primarySwitch);

    // ✅ Immediately check it's active
    expect(primarySwitch.checked).toBeTruthy();
    await waitFor(
      () =>
        expect(
          screen.getByTestId("active-24e124460d323974_valve_2").checked
        ).toBeTruthy(),
      { timeout: 10000 }
    );
  });
  it("should allow user to activate a secondary valve for a specific time range", async () => {
    const futureTime = dayjs().add(1, "hour").format("YYYY-MM-DD HH:mm");
    const turnOffTime = dayjs().add(2, "hour").format("YYYY-MM-DD HH:mm");

    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: true,
              active: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              manual: true,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", false),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings (still off)
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              active: true,
              once: true,
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              active: false,
              manual: true,
            }),
          ],
        },
      },
    ]);

    const turnOnPicker = await screen.findByTestId(
      "turnOnTime-24e124460d323974_valve_2"
    );
    const turnOffPicker = await screen.findByTestId(
      "turnOffTime-24e124460d323974_valve_2"
    );

    await userEvent.type(turnOnPicker, futureTime);
    await userEvent.tab();
    await userEvent.type(turnOffPicker, turnOffTime);
    await userEvent.tab();
    expect(turnOnPicker.value).toBe(futureTime);
    expect(turnOffPicker.value).toBe(turnOffTime);

    const saveButton = screen.getByText(/Save Settings/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      const secondarySwitch = screen.getByTestId(
        "active-24e124460d323974_valve_2"
      );
      expect(secondarySwitch.checked).toBeTruthy();
    });
  });
  it("should allow user to stop a valve by changing the mode manual in between the set time", async () => {
    await setupSwitchComponent([
      // 1️⃣ Initial load
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: true,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              once: true,
              active: true,
              turnOnTime: "2025-09-25T21:55:00",
              turnOffTime: "2025-09-25T23:15:00",
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              manual: true,
              active: false,
            }),
          ],
        },
      },
      // 2️⃣ Poll 1
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 3️⃣ Poll 2
      {
        data: {
          status: [
            statusResponse("24e124460d323974", false),
            statusResponse("24e124460d323974_valve_2", true),
            statusResponse("24e124460e222845", false),
          ],
        },
      },
      // 4️⃣ Reload settings (still off)
      {
        data: {
          value: [
            makeValve({
              id: "24e124460d323974",
              devEUI: "24e124460d323974",
              identifier: "valve_1",
              isSecondary: false,
              manual: true,
              active: false,
            }),
            makeValve({
              id: "24e124460d323974_valve_2",
              devEUI: "24e124460d323974",
              identifier: "valve_2",
              isSecondary: true,
              active: true,
              manual: true,
              turnOnTime: "",
              turnOffTime: "",
            }),
            makeValve({
              id: "24e124460e222845",
              devEUI: "24e124460e222845",
              identifier: "valve_3",
              isSecondary: true,
              active: false,
              manual: true,
            }),
          ],
        },
      },
    ]);
    const valveRow = screen.getByTestId("row-24e124460d323974_valve_2");

    const manualRadio = within(valveRow).getByLabelText("Manual");
    await userEvent.click(manualRadio);

    const saveButton = screen.getByText(/Save Settings/i);
    await userEvent.click(saveButton);

    const turnOnPicker = screen.getByTestId(
      "turnOnTime-24e124460d323974_valve_2"
    );
    const turnOffPicker = screen.getByTestId(
      "turnOffTime-24e124460d323974_valve_2"
    );

    expect(turnOnPicker.value).toBe("2025-09-25 21:55");
    expect(turnOffPicker.value).toBe("2025-09-25 23:15");
  });
});
