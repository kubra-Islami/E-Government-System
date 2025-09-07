import pool from "../config/db.js";
import path from "path";

import * as OfficerService from "../services/officer.service.js";
import { getNotificationsByUserId } from "../services/notification.service.js";

export const dashboard = async (req, res) => {
    try {
        const { q = "", status = "", from = "", to = "" } = req.query;

        // Fetch requests for officer's department
        const requests = await OfficerService.getRequests(req.user.department_id);

        // Fetch notifications for this officer
        const notifications = await getNotificationsByUserId(req.user.id);

        res.render("officer/dashboard", {
            layout: "layouts/officer_layout",
            title: "Officer Dashboard",
            requests,
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
    const requests = await OfficerService.getRequests(req.user.department_id);
    const notifications = await getNotificationsByUserId(req.user.id);
    res.render("officer/requestsList", { title: "Requests", requests ,  layout: "layouts/officer_layout", success: null, error: null, notifications});
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
    const { status } = req.body;
    await OfficerService.reviewRequest(req.params.id, status, req.user);
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
        const filePath = path.join(process.cwd(), "uploads", doc.file_path);

        res.download(filePath, doc.original_name || "document");
    } catch (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Server error");
    }
};

export const searchRequests = async (req, res) => {
    const requests = await OfficerService.getRequests(req.user.department_id);
    res.render("officer/requests", { title: "Search Results", requests });
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
