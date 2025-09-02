import * as RequestDAO from '../dao/request.dao.js';
import * as NotificationDAO from '../dao/notification.dao.js';
import * as UserDAO from '../dao/user.dao.js';

export async function listRequestsForOfficer(officerUser, filters) {
    const departmentId = officerUser.department_id;
    // console.log('departmentId ', departmentId);
    return await RequestDAO.getRequestsForDepartment({ departmentId, ...filters });
}

export async function getRequestDetail(officerUser, requestId) {
    const request = await RequestDAO.getRequestById(requestId);
    if (!request) throw new Error('Not found');
    if (request.department_id !== officerUser.department_id && officerUser.role !== 'admin') {
        throw { status: 403, message: 'Forbidden' };
    }
    const docs = await RequestDAO.getDocumentsByRequestId(requestId);
    return { request, documents: docs };
}

export async function reviewRequest({ officerUser, requestId, action, comment }) {
    // action: 'approve' | 'reject'
    const request = await RequestDAO.getRequestById(requestId);
    if (!request) throw new Error('Not found');
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

    // create in-app notification for citizen
    const title = `Your request ${request.request_number} was ${newStatus}`;
    const message = comment ? `${comment}` : `Your request status changed to ${newStatus}`;
    await NotificationDAO.createNotification({
        user_id: request.citizen_id,
        title,
        message,
        link: `/citizen/requests/${requestId}`
    });

    // (Optional) send email asynchronously (use background job / queue)
    // Email sending should be queued rather than blocking request

    return updated;
}
