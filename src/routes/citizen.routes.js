import express from "express";
const router = express.Router();
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {
    getCitizenDashboard,
    getServicesByDepartment,
    getCitizenRequests,
    getPaymentPage,
    submitPayment,
    getCitizenProfile,
    updateCitizenProfile,
    uploadAvatar, getDepartments, applicationForm, submitApplication
} from "../controller/citizen.controller.js";
import { getRequestsByCitizenId } from "../services/requests.service.js";

import multer from "multer";
import path from "path";
import {getPaymentSuccess} from "../controller/payment.service.js";
import {getNotificationsByUserId} from "../services/notification.service.js";
import {getNotificationsPage, markNotificationRead} from "../controller/notification.controller.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        const uniqueName = `${Date.now()}-${base}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.get("/dashboard",authMiddleware,getCitizenDashboard );

// Show the "Apply for Service" page
router.get("/departments", authMiddleware, getDepartments);
router.get("/department-services/:departmentId", authMiddleware,getServicesByDepartment);

router.get("/services/apply/:serviceId", authMiddleware, applicationForm);

router.get("/requests",authMiddleware, getCitizenRequests);

// Show payment page for a request
router.get("/payments/:requestId",authMiddleware, getPaymentPage);

// Handle payment submission
router.post("/payments/:requestId", authMiddleware, submitPayment);
router.post(
    "/services/apply/:serviceId",
    authMiddleware,
    upload.array("documents"),
    submitApplication
);

router.get("/payments", authMiddleware, async (req, res, next) => {
    try {
        const notifications = await getNotificationsByUserId(req.user.id);
        const requests = await getRequestsByCitizenId(req.user.id);
        const pendingRequests = requests.filter(r => r.status !== "paid");
        res.render("citizen/pendingPayments", {
            title: "Pending Payments",
            layout: "layouts/citizen_layout",
            requests: pendingRequests,
            notifications
        });
    } catch (err) {
        next(err);
    }
});

router.get("/success/:paymentId", getPaymentSuccess);

// Get profile page
router.get("/profile", authMiddleware, getCitizenProfile);

// Update profile
router.post("/profile/update", authMiddleware, updateCitizenProfile);

// Upload avatar
router.post("/profile/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

// Notifications routes
router.get("/notifications", authMiddleware, getNotificationsPage);
router.post("/notifications/mark-read/:id", authMiddleware, markNotificationRead);

export default router;
