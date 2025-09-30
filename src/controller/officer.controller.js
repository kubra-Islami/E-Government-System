import pool from "../config/db.js";
import path from "path";

import * as OfficerService from "../services/officer.service.js";
import { getNotificationsByUserId } from "../services/notification.service.js";
import {getServicesByDepartmentId} from "../dao/service.dao.js";
import * as profileService from "../services/profile.service.js";

export const dashboard = async (req, res) => {
    try {
        const { q = "", status = "", from = "", to = "" } = req.query;

        // Fetch requests for officer's department
        const requests = await OfficerService.getRequests(req.user.department_id);

        // Fetch notifications for this officer
        const notifications = await getNotificationsByUserId(req.user.id);
        const services = getServicesByDepartmentId(req.user.id);


        res.render("officer/dashboard", {
            layout: "layouts/officer_layout",
            title: "Officer Dashboard",
            requests,
            services,
            q,
            status,
            activePage: "dashboard",
            fromDate: from,
            toDate: to,
            user: req.user,
            notifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

export const requestsList = async (req, res) => {
    const { q, status, from, to } = req.query;

    const requests = await OfficerService.searchRequests({
        departmentId: req.user.department_id,
        q,
        status,
        from,
        to
    });

    const notifications = await getNotificationsByUserId(req.user.id);

    res.render("officer/requestsList", {
        title: "Requests",
        requests,
        layout: "layouts/officer_layout",
        success: null,
        error: null,
        notifications,
        q,
        status,
        fromDate: from,
        toDate: to
    });
};


export const requestDetail = async (req, res) => {
    const requestId = req.params.id;
    try {
        const requestResult = await pool.query(
            `SELECT r.*,
                    s.name  AS service_name,
                    d.name  AS department_name,
                    c.name  AS citizen_name,
                    c.email AS citizen_email
             FROM requests r
                      JOIN services s ON r.service_id = s.id
                      JOIN departments d ON s.department_id = d.id
                      JOIN users c ON r.citizen_id = c.id
             WHERE r.id = $1`,
            [requestId]
        );

        const request = requestResult.rows[0];
        if (!request) {
            return res.status(404).send("Request not found");
        }

        const documentsResult = await pool.query(
            "SELECT * FROM documents WHERE request_id = $1",
            [requestId]
        );
        const notifications = await getNotificationsByUserId(req.user.id);
        res.render("officer/request_detail", {
            layout: "layouts/officer_layout",
            request,
            title: "Request Details",
            documents: documentsResult.rows,
            notifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};

export const postReview = async (req, res) => {
    const { action, comment } = req.body;

    let status;
    if (action === "review") status = "under_review";
    else if (action === "approve") status = "approved";
    else if (action === "reject") status = "rejected";
    else status = "submitted";

    await OfficerService.reviewRequest(req.params.id, status, req.user, comment);
    res.redirect(`/officer/requests/${req.params.id}`);
};


export const assignRequest = async (req, res) => {
    const { officerId } = req.body;
    await OfficerService.assignRequest(req.params.id, officerId);
    res.redirect(`/officer/requests/${req.params.id}`);
};

export const addNote = async (req, res) => {
    await OfficerService.addNote(req.params.id, req.user, req.body.note);
    res.redirect(`/officer/requests/${req.params.id}`);
};

export const getNotes = async (req, res) => {
    const notes = await OfficerService.getNotes(req.params.id);
    res.json(notes);
};

export const sendNotification = async (req, res) => {
    const { message } = req.body;
    await OfficerService.reviewRequest(
        req.params.id,
        "notified",
        req.user,
        message
    );
    res.redirect(`/officer/requests/${req.params.id}`);
};

export const uploadDocument = async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    await OfficerService.uploadDocument(req.params.id, req.file);
    res.redirect(`/officer/requests/${req.params.id}`);
};

export const downloadDocument = async (req, res) => {
    try {
        const doc = await OfficerService.downloadDocument(req.params.id);

        if (!doc) {
            return res.status(404).send("Document not found");
        }

        // Always prepend uploads at runtime
        const filePath = path.join(process.cwd(), doc.file_path);

        setTimeout(()=>{
            res.download(filePath, doc.original_name || doc.file_path);
        },400)

    } catch (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Server error");
    }
};



export const searchRequests = async (req, res) => {
    const { q, status, from, to } = req.query;

    const requests = await OfficerService.searchRequests({
        departmentId: req.user.department_id,
        q,
        status,
        from,
        to
    });

    res.render("officer/requestsList", {
        title: "Search Results",
        layout: "layouts/officer_layout",
        requests,
        q,
        status,
        fromDate: from,
        toDate: to
    });
};

export const profile = async (req, res) => {
    try {
        const officerId = req.user.id;
        const officer = await OfficerService.getOfficerById(officerId);
        if (!officer) {
            return res.status(404).send("Officer not found");
        }
        res.render("officer/profile", {
            officer,
            layout: "layouts/officer_layout",
            title: "Profile",
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};

// POST update profile
export const updateOfficerProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let { name, email ,job_title } = req.body;

        await profileService.updateProfile(userId, { name, email ,job_title});
        res.redirect("/officer/profile");
    } catch (err) {
        next(err);
    }
};