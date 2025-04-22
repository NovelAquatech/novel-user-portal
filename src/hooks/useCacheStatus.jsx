import { createContext, useContext, useMemo, useState } from "react";
const DevicesStatusContext = createContext();

export const CacheStatusProvider = ({ children }) => {
  const [isDevicesFetched, setIsDevicesFetched] = useState(false);
  const [fetchedDevices, setFetchedDevices] = useState([]);
  const [isMachinesFetched, setIsMachinesFetched] = useState(false);
  const [fetchedMachines, setFetchedMachines] = useState([]);

  const value = useMemo(
    () => ({
      isDevicesFetched,
      setIsDevicesFetched,
      fetchedDevices,
      setFetchedDevices,
      isMachinesFetched,
      setIsMachinesFetched,
      fetchedMachines,
      setFetchedMachines
    }),
    [isDevicesFetched, fetchedDevices, isMachinesFetched, fetchedMachines]
  );

  return (
    <DevicesStatusContext.Provider value={value}>
      {children}
    </DevicesStatusContext.Provider>
  );
};

export const useCacheStatus = () => {
  return useContext(DevicesStatusContext);
};
