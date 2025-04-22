import { saveAs } from "file-saver";
import * as XLSX from 'xlsx';
import { limitingCharInStr } from "./utils";
export const downloadExcel = (data, columns, devices, user) => {
    try {
        const orgName = user.orgName;
        // Create the Excel file
        const workbook = XLSX.utils.book_new();
        Object.keys(data).forEach((key) => {
            const device = devices.filter((device)=> device.devEUI === key);
            const sheetName = limitingCharInStr(device[0]["devName"], 25);
            const sheetData = data[key];
            const excelData = [
                columns.map((column) => column.title),
                ...sheetData.map((item) => columns.map((column) => item[column.dataKey])),
            ];
            // Append sheet
            const worksheet = XLSX.utils.aoa_to_sheet(excelData);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        // Download file
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Detailed-Analysis-Report-${orgName}.xlsx`);
    } catch (error) {
        console.error("Error generating Excel:", error);
        throw error;
    }
};

export const downloadExcelRailfall = (data, columns, user) => {
    try {
        const orgName = user.orgName;
        // Create the Excel file
        const workbook = XLSX.utils.book_new();
        data.series.forEach((dt) => {
            const sheetName = limitingCharInStr(dt.name, 25);
            const excelData = [
                columns.map((column) => column.title),
                ...data.xLabels.map((xval, index) => [xval, dt.data[index]])
            ];
            // Append sheet
            const worksheet = XLSX.utils.aoa_to_sheet(excelData);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        // Download file
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Detailed-Analysis-Report-${orgName}.xlsx`);
    } catch (error) {
        console.error("Error generating Excel:", error);
        throw error;
    }
};
