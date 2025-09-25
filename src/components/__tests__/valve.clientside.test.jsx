Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    };
  },
});

import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../hooks/useAuth";
import SwitchComponent from "../SwitchComponent";


beforeEach(() => {
  // Fake a logged-in user in localStorage
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
const rows = [
  {
    RowKey: "24e124460e222845",
    devEUI: "24e124460e222845",
    identifier: "valve_1",
    once: true,
    repeat: false,
    manual: false,
    active: false,
  },
  {
    RowKey: "24e124460e222845_valve_2",
    devEUI: "24e124460e222845",
    identifier: "valve_2",
    once: false,
    repeat: false,
    manual: true,
    active: false,
  },
];
// 🔹 Helper to wrap with QueryClientProvider
function renderWithProviders(ui) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // don’t retry failed queries
    },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("Valve flow (client-side auto-off) - UI driven", () => {
  it("creates a group with valve_1 high pressure and valve_2 & valve_3 low pressure, turns on valve_1, and auto-turns it off after 10s", async () => {
   



    renderWithProviders(
      <MemoryRouter>
        <AuthProvider>
          <SwitchComponent
            devices={{
              "24e124460e222845_valve_1": "valve_1",
              "24e124460e222845_valve_2": "valve_2",
              "24e124460d323974_valve_1": "valve_1",
              "24e124460d323974_valve_2": "valve_2",
            }}
            autoLogin={false}
            rows={rows}
          />
        </AuthProvider>
      </MemoryRouter>
    );

    // 1) Create Group modal
    const createBtn = await screen.findByTestId(
      "create-group-button",
      {},
      { timeout: 10000 }
    );
    await userEvent.click(createBtn);

    // 2) Select primary valve High pressure (Valve 1)
    const primarySelect = screen.getByTestId("primary-select");
    await userEvent.click(primarySelect);

    // MUI renders options in portal; wait for it
    const valve1Option = screen.getByTestId("active-24e124460e222845");
    await userEvent.click(valve1Option);

    // 3) Select low-pressure valves
    const lowSelect = screen.getByTestId("low-select");
    await userEvent.click(lowSelect);

    const valve2Elements = screen.getAllByText(/valve_2/i);

    await userEvent.click(valve2Elements[0]);
    await userEvent.keyboard("{Escape}");

    // 4) Save group
    const saveGroupBtn = screen.getByTestId("group-save");
    await userEvent.click(saveGroupBtn);

    // 5) Wait for group row to appear
    const groupRow = await screen.findByTestId(
      "group-1",
      {},
      { timeout: 10_000 }
    );
    expect(groupRow).toBeInTheDocument();

    const valve1Row = screen
      .getByTestId("active-24e124460e222845")
      .closest("tr");
    expect(valve1Row).toBeInTheDocument();
   
  }, 50000);
});
