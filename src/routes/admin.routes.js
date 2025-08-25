import express from "express";
import {
    deleteUserController,
    getAdminDashboard,
    showReports,
    showUsers,
    showDepartments,
    showServices
} from "../controller/admin.controller.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Users
router.get("/users", showUsers);
router.get("/users/:id/delete", deleteUserController);

// Reports
router.get("/reports", showReports);
router.get("/departments", showDepartments);
router.get("/services", showServices);

export default router;
