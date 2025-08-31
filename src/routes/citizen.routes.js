import express from "express";
const router = express.Router();
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {
    getCitizenDashboard,
    getServicesAndDepartments,
    getServicesByDepartment,
     getCitizenRequests, submitServiceApplication
} from "../controller/citizen.controller.js";

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // folder where files will be saved
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
