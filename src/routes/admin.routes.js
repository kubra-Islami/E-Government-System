import express from "express";
import {
    deleteUserController,
    getAdminDashboard,
    showReports,
    showUsers,
    showDepartments,
    showServices, showGlobalSearch, editUserController, updateUserController
} from "../controller/admin.controller.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Users
router.get("/users", showUsers);
router.get("/users/:id/delete", deleteUserController);
router.get("/users/:id/edit", editUserController);
router.post("/users/:id/edit", updateUserController);

// Reports
router.get("/reports", showReports);
router.get("/departments", showDepartments);
router.get("/services", showServices);
router.get("/search", showGlobalSearch);


export default router;
