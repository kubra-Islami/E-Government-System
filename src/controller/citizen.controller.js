import {getServiceById, getServicesByDepartmentId} from "../dao/service.dao.js";

import {getRequestsByCitizenId, getStatsResult} from "../dao/request.dao.js";
import {getRequestById, createRequest, saveDocument} from "../services/requests.service.js";
import {getAllDepartments} from "../services/department.service.js";
import { addPayment } from "../services/payments.service.js";
import * as profileService from "../services/profile.service.js";
import { getNotificationsByUserId } from "../services/notification.service.js";
import {getAllServices} from "../services/service.service.js";
import {getRecentActivities} from "../services/profile.service.js";


export const getCitizenDashboard = async (req, res, next) => {
    try {
        const citizenId = req.user.id;

        // Fetch notifications
        const allNotifications = await getNotificationsByUserId(citizenId);
        const unreadCount = allNotifications.filter(n => !n.is_read).length;

        // Limit to 5 latest for display
        const latestNotifications = allNotifications.slice(0, 5).map(n => ({
            id: n.id,
            message: n.message,
            timeAgo: new Date(n.created_at).toLocaleString(),
        }));

        // Fetch recent applications/requests
        const recentActivities = await getRecentActivities(citizenId);
        const recentRequests = recentActivities.map(act => ({
            id: act.id || null, // depends on your activities schema
            serviceName: act.service_name || act.description || "N/A",
            status: act.status || "Pending",
            lastUpdated: act.date,
        }));

        // Stats
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
            notifications: { unread: unreadCount },
            latestNotifications,
            recentRequests,
            stats,
        });
    } catch (err) {
        console.error("Error loading citizen dashboard:", err);
        next(err);
    }
};


export const getCitizenNotifications = async (req, res, next) => {
    try {
        const notifications = await getNotificationsByUserId(req.user.id);
        res.render("citizen/notifications", {
            layout: "layouts/citizen_layout",
            title: "Notifications",
            user: req.user,
            notifications : null,
        });
    } catch (err) {
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

export const getDepartments = async (req, res, next) => {
    try {
        const notifications = await getNotificationsByUserId(req.user.id);
        const departments = await getAllDepartments();
        const allServices = await getAllServices();
        // Organize services by department
        const departmentsWithServices = departments.map(department => {
            const servicesForDepartment = allServices.filter(service => service.department_id === department.id);
            return {
                ...department,
                services: servicesForDepartment
            };
        });
        res.render("citizen/departments", {
            title: "Departments List",
            layout: "layouts/citizen_layout",
            user: req.user,
            departments: departmentsWithServices,
            notifications
        });
    } catch (err) {
        next(err);
    }
};

export const applicationForm = async (req, res, next) => {
    try {
        const { serviceId } = req.params;
        const service = await getServiceById(parseInt(serviceId, 10));
        if (!service) {
            return res.status(404).send("Service not found.");
        }
        service.departmentName = service.department_name || 'Unknown Department';

        res.render("citizen/request-form", {
            layout: "layouts/citizen_layout",
            title: service.name + " Application",
            user: req.user,
            service,
        });

        console.log("Service formFields:", service.formFields);
        console.log("Service requiredDocuments:", service.requiredDocuments);

    } catch (err) {
        console.error("Failed to render application form:", err);
        next(err);
    }
};

export const submitApplication = async (req, res, next) => {
    try {
        const { serviceId } = req.params;
        const citizenId = req.user.id;

        // Form data (dynamic fields)
        const formData = req.body;
        const files = req.files || [];

        // Save request
        const request = await createRequest({
            citizen_id: citizenId,
            service_id: serviceId,
            status: "submitted",
            form_data: JSON.stringify(formData)
        });

        // Save uploaded documents
        for (const file of files) {
            await saveDocument({
                request_id: request.id,
                file_path: `/uploads/${file.filename}`,
                original_name: file.originalname
            });
        }



        res.redirect("/citizen/requests");
    } catch (err) {
        console.error("Error submitting application:", err);
        next(err);
    }
};


export const getServicesByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        // Convert the string departmentId to a number
        const departmentIdNum = parseInt(departmentId, 10);

        const notifications = await getNotificationsByUserId(req.user.id);
        const departments = await getAllDepartments();
        const services = await getServicesByDepartmentId(departmentIdNum);

        // Now, find will work correctly as both values are numbers
        const selectedDepartment = departments.find(d => d.id === departmentIdNum);

        res.render("citizen/departmentServices", {
            title: selectedDepartment ? selectedDepartment.name : "Department Services",
            layout: "layouts/citizen_layout",
            user: req.user,
            services,
            departmentId,
            selectedDepartment,
            notifications
        });
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
        res.render("citizen/payment-success", {layout: "layouts/citizen_layout"});
        // res.redirect("/citizen/");
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
