import * as RequestDAO from '../dao/request.dao.js';
import * as NotificationDAO from '../dao/notification.dao.js';
import * as ServiceDAO from '../dao/service.dao.js';
import * as OfficerDAO from "../dao/officer.dao.js";
import {createNotification} from "../dao/notification.dao.js";

export async function listRequestsForOfficer(officerUser, filters) {
    const departmentId = await RequestDAO.getOfficerDepartmentId(officerUser.id);

    if (!departmentId) {
        console.warn('Officer is not assigned to a department');
        return [];
    }
    return await RequestDAO.getRequestsForDepartment({
        departmentId,
        ...filters
    });
}

export async function getRequestsByDepartment(departmentId) {
    return await RequestDAO.getRequestsByDepartment(departmentId);
}

export async function getServicesByDepartment(departmentId) {
    return await ServiceDAO.getServicesByDepartment(departmentId);
}


export const getRequests = async (departmentId) => {
    return OfficerDAO.findRequestsByDepartment(departmentId);
};

export const getRequestDetail = async (requestId) => {
    return OfficerDAO.findRequestById(requestId);
};


export const reviewRequest = async (requestId, status, officer,comment) => {
    const request = await OfficerDAO.updateRequestStatus(
        requestId,
        status,
        officer.id,
        comment
    );

    console.log(request);
    // Notify citizen
    await createNotification(
        request.citizen_id,
        request.id,
        `Your request #${request.request_number} has been ${status.replace('_', ' ')} by officer ${officer.name}. Comment: "${comment}"`
    );

    return request;
};

export const assignRequest = async (requestId, officerId) => {
    return OfficerDAO.assignRequest(requestId, officerId);
};

export const addNote = async (requestId, officer, note) => {
    const savedNote = await OfficerDAO.addNote(requestId, officer.id, note);

    // Notify citizen
    await createNotification(
        savedNote.request_id,
        requestId,
        `Officer ${officer.name} added a note on your request.`
    );

    return savedNote;
};

export const getNotes = async (requestId) => {
    return OfficerDAO.getNotes(requestId);
};

export const uploadDocument = async (requestId, file) => {
    return OfficerDAO.addDocument(requestId, file.originalname, file.path);
};

export const getOfficerById = async (id) => {
    return OfficerDAO.findById(id);
};

export const downloadDocument = async (documentId) => {
    return OfficerDAO.findDocumentById(documentId);
};
