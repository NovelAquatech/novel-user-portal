import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  // call this function when you want to set user data
  const setUserData = async (data) => {
    console.log(data)
    setUser(data);
    // if(data.orgName === 'SeelyEnergyMonitor') navigate("/machines");
    // else navigate("/devices");
    navigate("/report");
  };

  // call this function to remove user data
  const removeUserData = () => {
    setUser(null);
    navigate("/");
  };

  const value = useMemo(
    () => ({
      user,
      setUserData,
      removeUserData,
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
