import { useState } from "react";
import * as MaterialDesign from "react-icons/md";
import {BaseModal} from "./Popup";
export const DeviceModel = ({ isOpen, closeModel, device }) => {
  return (
    <BaseModal
      isOpen={isOpen}
      closeModal={closeModel}
      title={
        <>
          <MaterialDesign.MdAir color="#00bdd5" size={20} /> {device.devName}
        </>
      }
      footer={
        <button
          type="button"
          className="btn btn-info btn-sm"
          data-dismiss="modal"
          onClick={closeModel}
        >
          OK
        </button>
      }
    >
      <table className="tbl" style={{ width: "100%" }}>
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
    </BaseModal>
  );
};