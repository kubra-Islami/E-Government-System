import express from "express";
import {
    deleteUserController,
    getAdminDashboard,
    showReports,
    showUsers,
    showDepartments,
    showGlobalSearch, showUserController, updateUserController
} from "../controller/admin.controller.js";
import {addDepartmentController} from "../controller/department.controller.js";
import {addServiceController, showServices} from "../controller/service.controller.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Users
router.get("/users", showUsers);
router.get("/users/:id/delete", deleteUserController);
router.get("/users/:id/show", showUserController);
router.post("/users/:id/edit", updateUserController);

// Reports
router.get("/reports", showReports);
router.get("/services", showServices);
router.get("/search", showGlobalSearch);

// department routes
router.get("/departments", showDepartments);
router.post("/add_department", addDepartmentController);

//Service routes
router.post("/add_service", addServiceController);

export default router;
