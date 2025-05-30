import { useState } from "react";
import * as MaterialDesign from "react-icons/md";

export const DeviceModel = ({ isOpen, closeModel, device }) => {
    // Simple mobile detection
    const isMobile = window.innerWidth <= 600;

    return (
        <>
            <div
                className={isOpen ? "modal fade in" : "modal fade"}
                tabIndex="-1"
                role="dialog"
                style={{
                    display: isOpen ? "flex" : "none",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.3)",
                    zIndex: 1050,
                }}
            >
                <div
                    className="modal-dialog"
                    role="document"
                    style={{
                        width: "100%",
                        maxWidth: isMobile ? "80vw" : "500px",
                        margin: 0,
                    }}
                >
                    <div className="modal-content" style={isMobile ? { borderRadius: 8, fontSize: 14 } : {}}>
                        <div className="modal-header">
                            <button type="button" className="close" onClick={closeModel}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h5 className="modal-title" id="myModalLabel">
                                <MaterialDesign.MdAir color="#00bdd5" size={20} /> {device.devName}
                            </h5>
                        </div>
                        <div className="modal-body">
                            <table className="tbl" style={isMobile ? { width: "100%" } : {}}>
                                <tbody>
                                    <tr>
                                        <th><strong>Device Added</strong></th>
                                        <td>{device.deviceAdded}</td>
                                    </tr>
                                    <tr>
                                        <th><strong>Device Type</strong></th>
                                        <td>{device.deviceType}</td>
                                    </tr>
                                    <tr>
                                        <th><strong>Device EUI</strong></th>
                                        <td>{device.devEUI}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-info btn-sm" data-dismiss="modal" onClick={closeModel}>OK</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}