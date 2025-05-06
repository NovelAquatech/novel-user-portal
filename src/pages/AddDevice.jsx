import React, { useState, useEffect } from "react";
import { Navbar } from "../components/nav";
import { Footer } from "../components/footer";
import { CirclesWithBar } from "react-loader-spinner";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { APP_CONST } from "../helper/application-constant";

export const AddDevicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [device, setDevice] = useState([]);
  const [formData, setFormData] = useState({
    deviceName: "",
    deviceEUI: "",
    orgName: "",
  });

    // let url = `${
    //   import.meta.env.VITE_DEVICE_API_URL
    // }/triggers/When_a_HTTP_request_is_received/paths/invoke`;
    // url = `${url}?api-version=${APP_CONST.API_VERSION}`;
    // url = `${url}&sp=${APP_CONST.SP}`;
    // url = `${url}&sv=${APP_CONST.SV}`;
    // url = `${url}&sig=${import.meta.env.VITE_DEVICE_API_URL_SIG}`;
    // url = `${url}&orgName=${user.orgName}`;
    // url = `${url}&authToken=${user.token}`;


  useEffect(() => {
    if (user?.orgName) {
      setFormData((prev) => ({
        ...prev,
        orgName: user.orgName,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoaderVisible(true);
    const payload = {
        deviceName: formData.deviceName,
        devEUI: formData.deviceEUI,
        orgName: user.orgName,
        timestamp: new Date().toISOString(),        
      };

      console.log("Payload: ", payload);
      
      try {
        // await axios.post(url, payload);
        // toast.success(`Device "${formData.deviceName}" added.`);
        setFormData({ deviceName: "", deviceEUI: "", orgName: user.orgName });
        navigate("/devices");
      } catch (err) {
        toast.error("Error adding device. Please try again.");

      } finally {
        setLoaderVisible(false);
      }
  };

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
          <div
            className="col-md-12 col-sm-12 col-xs-12 d-flex justify-content-center align-items-center"
            style={{ minHeight: "100vh", marginTop: "5%" }}
          >
            <div>
              <h3 style={{ textAlign: "center" }}>
                <strong>Add Device</strong>
              </h3>
              <form
                onSubmit={handleSubmit}
                style={{
                  width: "50%",
                  marginLeft: "25%",
                  border: "1px solid #ccc",
                  padding: "20px",
                  borderRadius: "5px",
                }}
              >
                <div>
                  <label htmlFor="deviceName" className="form-label">
                    Device Name:
                  </label>
                  <input
                    type="text"
                    id="deviceName"
                    name="deviceName"
                    className="form-control"
                    value={formData.deviceName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="deviceEUI" className="form-label">
                    Device EUI:
                  </label>
                  <input
                    type=""
                    id="deviceEUI"
                    name="deviceEUI"
                    className="form-control"
                    value={formData.deviceEUI}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="orgName" className="form-label">
                    Organization Name:
                  </label>
                  <input
                    type="text"
                    id="orgName"
                    name="orgName"
                    className="form-control"
                    value={formData.orgName}
                    readOnly
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  style={{ marginTop: "5%" }}
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
