import * as DepartmentHeadDAO from "../dao/departmentHead.dao.js";


export async function getDepartments() {
    return await DepartmentHeadDAO.getDepartments();
}
export async function getDepartmentStats(departmentId) {
    return await DepartmentHeadDAO.fetchDepartmentStats(departmentId);
}

export async function getOfficers(departmentId) {
    return await DepartmentHeadDAO.findOfficersByDepartment(departmentId);
}

export async function addOfficer(departmentId, officerData) {
    return await DepartmentHeadDAO.insertOfficer(departmentId, officerData);
}

export async function removeOfficer(departmentId) {
    return await DepartmentHeadDAO.deleteOfficer(departmentId);
}

export async function getRequests(departmentId) {
    return await DepartmentHeadDAO.findRequestsByDepartment(departmentId);
}

export async function getRequestById(requestId, departmentId) {
    return await DepartmentHeadDAO.findRequestById(requestId, departmentId);
}

export async function getDepartmentReports(filter) {
    return await DepartmentHeadDAO.getDepartmentReports(filter);
}



