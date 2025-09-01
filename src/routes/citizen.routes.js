import express from "express";
const router = express.Router();
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {
    getCitizenDashboard,
    getServicesAndDepartments,
    getServicesByDepartment,
    getCitizenRequests,
    submitServiceApplication,
    getPaymentPage,
    submitPayment,
    getCitizenProfile,
    updateCitizenProfile,
    uploadAvatar
} from "../controller/citizen.controller.js";
import { getRequestsByCitizenId } from "../services/requests.service.js";

import multer from "multer";
import path from "path";
import {getPaymentSuccess} from "../controller/payment.service.js";
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
router.get("/applyService", authMiddleware, getServicesAndDepartments);

// Handle form submission
router.post("/applyService", authMiddleware, upload.array("documents"), submitServiceApplication);

router.get("/services/:departmentId", authMiddleware,getServicesByDepartment);

router.get("/requests",authMiddleware, getCitizenRequests);

// Show payment page for a request
router.get("/payments/:requestId",authMiddleware, getPaymentPage);

// Handle payment submission
router.post("/payments/:requestId", authMiddleware, submitPayment);

router.get("/payments", authMiddleware, async (req, res, next) => {
    try {
        const requests = await getRequestsByCitizenId(req.user.id);

        // console.log(requests);

        const pendingRequests = requests.filter(r => r.status !== "paid");
        res.render("citizen/pendingPayments", {
            title: "Pending Payments",
            requests: pendingRequests
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
