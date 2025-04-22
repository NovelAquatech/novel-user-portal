import { useState } from "react";
import * as MaterialDesign from "react-icons/md";

export const DeviceModel = ({ isOpen, closeModel, device }) => {
    return (
        <>
            <div className={isOpen ? "modal fade in" : "modal fade"} tabIndex="-1" role="dialog" style={{ display: isOpen ? "block" : "none" }}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={closeModel}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h5 className="modal-title" id="myModalLabel">
                                <MaterialDesign.MdAir color="#00bdd5" size={20} /> {device.devName}
                            </h5>
                        </div>
                        <div className="modal-body">
                            <table className="tbl">
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