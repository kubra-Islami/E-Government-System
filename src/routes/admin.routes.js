import express from "express";
import {
    deleteUserController,
    getAdminDashboard,
    showReports,
    showUsers,
    showDepartments,
    showGlobalSearch, showUserController, updateUserController, getAdminProfile,updateAdminProfile
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
import {authMiddleware} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import {uploadAvatar} from "../controller/upload.Controller.js";

const router = express.Router();

// Dashboard
router.get("/dashboard",authMiddleware, getAdminDashboard);

// Users
router.get("/users", showUsers);
router.get("/users/:id/delete",authMiddleware, deleteUserController);
router.get("/users/:id/show",authMiddleware, showUserController);
router.post("/users/:id/edit",authMiddleware, updateUserController);

// Reports
router.get("/reports", authMiddleware,showReports);
router.get("/search",authMiddleware, showGlobalSearch);

// department routes
router.get("/departments",authMiddleware, showDepartments);
router.post("/add_department",authMiddleware, addDepartmentController);

router.get("/departments/:id/show",authMiddleware, showDepartmentController);
router.post("/departments/:id/edit",authMiddleware, updateDepartmentController);
router.get("/departments/:id/delete",authMiddleware, deleteDepartmentController);

//Service routes
router.post("/add_service", authMiddleware,addServiceController);
router.get("/services",authMiddleware, showServices);

router.get("/services/:id/show",authMiddleware, showServiceController);
router.post("/services/:id/edit",authMiddleware, updateServiceController);
router.get("/services/:id/delete",authMiddleware, deleteServiceController);

// Get profile page
router.get("/profile",authMiddleware, getAdminProfile);

// Update profile
router.post("/profile/update",authMiddleware, updateAdminProfile);

// Upload avatar
router.post("/profile/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatar);


export default router;



