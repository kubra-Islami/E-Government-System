import express from "express";
import {
    deleteUserController,
    getAdminDashboard,
    showReports,
    showUsers,
    showDepartments,
    showGlobalSearch, showUserController, updateUserController, getAdminProfile
} from "../controller/admin.controller.js";
import {
    addDepartmentController, deleteDepartmentController,
    showDepartmentController,
    updateDepartmentController
} from "../controller/department.controller.js";
import {
    addServiceController, deleteServiceController,
    showServiceController,
    showServices,
    updateServiceController
} from "../controller/service.controller.js";

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
router.get("/search", showGlobalSearch);

// department routes
router.get("/departments", showDepartments);
router.post("/add_department", addDepartmentController);

router.get("/departments/:id/show", showDepartmentController);
router.post("/departments/:id/edit", updateDepartmentController);
router.get("/departments/:id/delete", deleteDepartmentController);

//Service routes
router.post("/add_service", addServiceController);
router.get("/services", showServices);

router.get("/services/:id/show", showServiceController);
router.post("/services/:id/edit", updateServiceController);
router.get("/services/:id/delete", deleteServiceController);

// Get profile page
router.get("/profile", getAdminProfile);
export default router;
