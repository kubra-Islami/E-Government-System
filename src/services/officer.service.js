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

// export async function getRequestDetail(officerUser, requestId) {
//     // Fetch request
//     const request = await RequestDAO.getRequestById(requestId);
//
//     if (!request) throw { status: 404, message: 'Not found' };
//
//     // Ensure the request belongs to officer's department
//     if (request.department_id !== officerUser.department_id) {
//         throw { status: 403, message: 'Forbidden' };
//     }
//
//     // Fetch associated documents
//     const documents = await RequestDAO.getDocumentsByRequestId(requestId);
//
//     return { request, documents };
// }


// export async function reviewRequest({ officerUser, requestId, action, comment }) {
//     const request = await RequestDAO.getRequestById(requestId);
//     if (!request) throw new Error('Not found');
//
//     // Prevent changing status if already approved/rejected
//     if (request.status === 'approved' || request.status === 'rejected') {
//         throw { status: 403, message: 'Cannot change status of a finalized request' };
//     }
//
//     let newStatus;
//     let updateData = {};
//
//     if (request.status === 'submitted') {
//         // First officer review → mark as under_review
//         newStatus = 'under_review';
//         updateData = {
//             first_reviewer_id: officerUser.id,
//             first_review_comment: comment,
//             first_reviewed_at: new Date()
//         };
//     } else if (request.status === 'under_review') {
//         // Final officer decision → approve or reject
//         newStatus = (action === 'approve') ? 'approved' : 'rejected';
//         updateData = {
//             final_reviewer_id: officerUser.id,
//             final_comment: comment,
//             final_reviewed_at: new Date()
//         };
//     }
//
//     // Update the request in the database
//     const updated = await RequestDAO.updateRequestStatus({
//         id: requestId,
//         status: newStatus,
//         ...updateData
//     });
//
//     // Notify the citizen
//     const title = `Your request ${request.request_number} is now ${newStatus}`;
//     const message = comment ? comment : `Your request status changed to ${newStatus}`;
//     await NotificationDAO.createNotification({
//         user_id: request.citizen_id,
//         title,
//         message,
//         link: `/citizen/requests/${requestId}`
//     });
//
//     return updated;
// }


export const getRequests = async (departmentId) => {
    return OfficerDAO.findRequestsByDepartment(departmentId);
};

export const getRequestDetail = async (requestId) => {
    return OfficerDAO.findRequestById(requestId);
};


export const reviewRequest = async (requestId, status, officer) => {
    const request = await OfficerDAO.updateRequestStatus(
        requestId,
        status,
        officer.id
    );

    // Notify citizen
    await createNotification(
        request.citizen_id,
        request.id,
        `Your request #${request.id} has been ${status} by officer ${officer.name}`
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
