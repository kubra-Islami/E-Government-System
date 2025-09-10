import {getServicesByDepartmentId} from "../dao/service.dao.js";

import {getRequestsByCitizenId, getStatsResult} from "../dao/request.dao.js";
import {addDocument} from "../services/documents.service.js";
import {addRequest ,getRequestById} from "../services/requests.service.js";
import {getAllServices} from "../services/service.service.js";
import {getAllDepartments} from "../services/department.service.js";
import { addPayment } from "../services/payments.service.js";
import * as profileService from "../services/profile.service.js";
import { getNotificationsByUserId } from "../services/notification.service.js";


export const getCitizenDashboard = async (req, res, next) => {
    try {
        const citizenId = req.user.id;
        const notifications = await getNotificationsByUserId(req.user.id);

        const statsResult = await getStatsResult(citizenId);
        const stats = statsResult.length > 0 ? statsResult[0] : {
            total_requests: 0,
            pending_requests: 0,
            total_payments: 0
        };

        res.render("citizen/dashboard", {
            layout: "layouts/citizen_layout",
            title: "Citizen Dashboard",
            user: req.user,
            notifications,
            stats,
        });
    } catch (err) {
        console.error("Error loading citizen dashboard:", err);
        next(err);
    }
};


export const getCitizenRequests = async (req, res, next) => {
    try {
        const notifications = await getNotificationsByUserId(req.user.id);

        const requests = await getRequestsByCitizenId(req.user.id);
        res.render("citizen/requests", {
            title: "My Applications",
            layout: "layouts/citizen_layout",
            user: req.user,
            requests,
            notifications
        });
    } catch (err) {
        next(err);
    }
};

export const getServicesAndDepartments = async (req, res, next) => {
    try {
        const notifications = await getNotificationsByUserId(req.user.id);
        const services = await getAllServices();
        const departments = await getAllDepartments();
        res.render("citizen/applyService", {
            title: "Request Services",
            layout: "layouts/citizen_layout",
            user: req.user,
            services,
            departments,
            notifications
        });
    } catch (err) {
        next(err);
    }
};

export const submitServiceApplication = async (req, res, next) => {
    try {
        const { department, service } = req.body;
        const citizenId = req.user.id;
        const serviceId = parseInt(req.body.service, 10);

        // Insert request
        const newRequest = await addRequest({
            citizen_id: citizenId,
            service_id: serviceId,
        });
        // Handle file uploads (if any)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await addDocument({
                    request_id: newRequest.id,
                    file_path: file.filename,
                    original_name: file.originalname
                });
            }
        }
        res.redirect("/citizen/payments");
    } catch (err) {
        console.error("Failed to add request:", err);
        next(err);
    }
};

export const getServicesByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const services = await getServicesByDepartmentId(departmentId);
        res.json(services);
    } catch (err) {
        next(err);
    }
};

export const getPaymentPage = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const request = await getRequestById(requestId);
        const notifications = await getNotificationsByUserId(req.user.id);

        if (!request) return res.status(404).send("Request not found");

        res.render("citizen/payments", {
            title: "Payments",
            request,
            layout: "layouts/citizen_layout",
            service: request.service,
            department: request.department,
            notifications
        });
    } catch (err) {
        next(err);
    }
};

export const submitPayment = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { paymentMethod } = req.body;

        // Simulate payment processing
        const paymentStatus = "success";

        // Insert payment record
        await addPayment({
            request_id: requestId,
            amount: req.body.amount,
            status: paymentStatus
        });

        // Optionally, update request status
        // await updateRequestStatus(requestId, "paid");

        res.redirect("/citizen/requests");
    } catch (err) {
        next(err);
    }
};


// GET profile page
export const getCitizenProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profileData = await profileService.getProfileById(userId);
        const recentActivities = await profileService.getRecentActivities(userId);

        const notifications = await getNotificationsByUserId(req.user.id);

        res.render("citizen/profile", {
            title: "My Profile",
            user: profileData,
            layout: "layouts/citizen_layout",
            recentActivities: recentActivities,
            notifications
        });
    } catch (err) {
        next(err);
    }
};

export const getProfilePage = async (req, res, next) => {
    try {
        const user = await getUserByIdDao(req.user.id);
        if (!user) return res.status(404).send("User not found");

        const recentActivities = await getRecentActivitiesByUserId(req.user.id);

        res.render("citizen/profile", { user, recentActivities });
    } catch (err) {
        next(err);
    }
};
// POST update profile
export const updateCitizenProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let { email, phone ,date_of_birth } = req.body;

        await profileService.updateProfile(userId, { email, phone ,date_of_birth});
        res.redirect("/citizen/profile");
    } catch (err) {
        next(err);
    }
};

// POST upload avatar
export const uploadAvatar = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

        if (avatarPath) {
            await profileService.updateProfile(userId, { avatar: avatarPath });
        }
        res.redirect("/citizen/profile");
    } catch (err) {
        next(err);
    }
};
