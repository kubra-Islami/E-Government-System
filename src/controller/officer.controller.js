import * as OfficerService from '../services/officer.service.js';
import * as DocumentDAO from "../dao/document.dao.js";
import pool from "../config/db.js";
import path from "path";

export async function dashboard(req, res) {
    const officer = req.user;
    // Read query params
    const { q, status, page = 1, limit = 20, from, to } = req.query;
    const filters = {
        search: q || null,
        status: status || null,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        fromDate: from || null,
        toDate: to || null,
    };

    const requests = await OfficerService.listRequestsForOfficer(officer, filters);

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
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        services: services.rows,
        activePage: "dashboard"
    });
}

export async function requestDetail(req, res) {
    try {
        const { request, documents } = await OfficerService.getRequestDetail(req.user, req.params.id);
        // console.log(request);
        res.render('officer/request_detail', { title: 'Request Detail', request, documents,activePage: "request_detail" });
    } catch (err) {
        if (err.status === 403) return res.status(403).send('Forbidden');
        return res.status(404).send('Not found');
    }
}

export async function requestsList(req, res) {
    const user = req.user;

    try {
        const requests = await OfficerService.getRequestsByDepartment(user.department_id);
        const services = await OfficerService.getServicesByDepartment(user.department_id);

        res.render('officer/requests', {
            user,
            requests,
            services,
            activePage: 'requests',
            q: req.query.q || '',
            status: req.query.status || '',
            fromDate: req.query.from || '',
            toDate: req.query.to || ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

export async function downloadDocument(req, res, next) {
    try {
        const docId = req.params.id;
        const document = await DocumentDAO.getById(docId);

        if (!document) {
            return res.status(404).send("Document not found");
        }

        // Build correct absolute path inside uploads/
        const filePath = path.join(process.cwd(), "uploads", document.file_path);

        return res.download(filePath, document.original_name);
    } catch (err) {
        console.error("Error downloading file:", err);
        next(err);
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
