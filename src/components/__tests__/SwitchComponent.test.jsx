import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "react-query";
import SwitchComponent from "../SwitchComponent";
import { AuthProvider } from "../../hooks/useAuth";
import { MemoryRouter } from "react-router-dom";


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
    turnOnTime: "2025-09-21T00:00:00",
    turnOffTime: "2025-09-22T00:02:00",
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
      token: "MTM1NDQ3ODU1MjAyNS0wOS0yMVQxMjozNzo1OC44NDY5MDQyWg==",
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
  it("should NOT activate High pressure valve when in manual mode and low-pressure valves are off", async () => {
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
});
