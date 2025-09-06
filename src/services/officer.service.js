import * as RequestDAO from '../dao/request.dao.js';
import * as NotificationDAO from '../dao/notification.dao.js';
import * as ServiceDAO from '../dao/service.dao.js';


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

export async function getRequestDetail(officerUser, requestId) {
    const request = await RequestDAO.getRequestById(requestId);
    if (!request) throw new Error('Not found');

    const docs = await RequestDAO.getDocumentsByRequestId(requestId);
    return {request, documents: docs};
}

export async function reviewRequest({ officerUser, requestId, action, comment }) {
    const request = await RequestDAO.getRequestById(requestId);
    if (!request) throw new Error('Not found');

    // Prevent changing status if already approved/rejected
    if (request.status === 'approved' || request.status === 'rejected') {
        throw { status: 403, message: 'Cannot change status of a finalized request' };
    }

    if (request.department_id !== officerUser.department_id && officerUser.role !== 'admin') {
        throw { status: 403, message: 'Forbidden' };
    }

    const newStatus = (action === 'approve') ? 'approved' : 'rejected';
    const updated = await RequestDAO.updateRequestStatus({
        id: requestId,
        status: newStatus,
        officer_id: officerUser.id,
        officer_comment: comment
    });

    const title = `Your request ${request.request_number} was ${newStatus}`;
    const message = comment ? comment : `Your request status changed to ${newStatus}`;
    await NotificationDAO.createNotification({
        user_id: request.citizen_id,
        title,
        message,
        link: `/citizen/requests/${requestId}`
    });

    return updated;
}

// (Optional) send email asynchronously (use background job / queue)
// Email sending should be queued rather than blocking request