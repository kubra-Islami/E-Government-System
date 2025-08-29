import express from "express";
const router = express.Router();
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {
    getCitizenDashboard,
    submitServiceApplication,
    getServicesByDepartment,
    submitServiceApplication1, getCitizenRequests
} from "../controller/citizen.controller.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

router.get("/dashboard",authMiddleware,getCitizenDashboard );

// Show the "Apply for Service" page
router.get("/applyService", authMiddleware, submitServiceApplication);
// Handle form submission
router.post("/applyService", authMiddleware, upload.array("documents"), submitServiceApplication1);

router.get("/services/:departmentId", authMiddleware,getServicesByDepartment);


router.get("/requests",authMiddleware, getCitizenRequests);

router.get("/payments",authMiddleware, (req, res) => {
    res.render("citizen/payments", { title: "Payments" });
});

router.get("/profile",authMiddleware, (req, res) => {
    res.render("citizen/profile", { title: "Profile",user: req.user}) ;
});

router.get("/notifications",authMiddleware, (req, res) => {
    res.render("citizen/notifications", { title: "Notifications" });
});

export default router;
