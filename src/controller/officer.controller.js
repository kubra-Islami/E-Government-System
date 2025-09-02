import * as OfficerService from '../services/officer.service.js';
import {getServicesByDepartment} from "./citizen.controller.js";
import pool from "../config/db.js";
export async function dashboard(req, res) {
    const officer = req.user;

    // Read query params
    const { q, status, page = 1, limit = 20, fromDate, toDate } = req.query;

    const filters = {
        search: q || null,
        status: status || null,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        fromDate: fromDate || null,
        toDate: toDate || null,
    };

    const requests = await OfficerService.listRequestsForOfficer(officer, filters);
    console.log('requests ', requests);
    const services = await pool.query(
        'SELECT * FROM services WHERE department_id = $1',
        [officer.department_id]
    );
    res.render('officer/dashboard', {
        title: 'Officer Dashboard',
        requests,
        q,
        status,
        page,
        limit,
        fromDate,
        toDate,
        services: services.fields,
        activePage: "dashboard"
    });
}


export async function requestDetail(req, res) {
    try {
        const { request, documents } = await OfficerService.getRequestDetail(req.user, req.params.id);
        res.render('officer/request_detail', { title: 'Request Detail', request, documents });
    } catch (err) {
        if (err.status === 403) return res.status(403).send('Forbidden');
        return res.status(404).send('Not found');
    }
}

export async function postReview(req, res) {
    const { action, comment } = req.body;
    const requestId = req.params.id;
    try {
        await OfficerService.reviewRequest({ officerUser: req.user, requestId, action, comment });
        res.redirect(`/officer/requests/${requestId}`);
    } catch (err) {
        return res.status(500).send(err.message || 'Error');
    }
}
