import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { DevicePage } from "./pages/Device";
import { AddDevicePage } from "./pages/AddDevice";
import { ReportPage } from "./pages/Report";
import { SettingPage } from "./pages/Setting";
import { SurveyPage } from "./pages/SurveyPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { CacheStatusProvider } from "./hooks/useCacheStatus";
import  CustomSetting  from "./pages/CustomSetting";
import { MachinePage } from "./pages/Machine";
import {CreateOrEditMachinePage} from "./pages/CreateOrEditMachine";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import "./App.css";
function App() {
  return (
    <AuthProvider>
      <CacheStatusProvider>
      <MantineProvider withGlobalStyles={false} withNormalizeCSS={false}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/machines"
          element={
            <ProtectedRoute>
              <MachinePage />
            </ProtectedRoute>
          }
        />
         <Route
            path="/machines/:RowKey?"
            element={
              <ProtectedRoute>
                <CreateOrEditMachinePage />
              </ProtectedRoute>
            }
          />
        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DevicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/devices/new"
          element={
            <ProtectedRoute>
              <AddDevicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <SettingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customsetting"
          element={
            <ProtectedRoute>
              <CustomSetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      </MantineProvider>
      </CacheStatusProvider>
    </AuthProvider>
  );
}

export default App;
