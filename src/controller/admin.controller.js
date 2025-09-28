import {
    getDashboardStats, getReportsAdmin,
    getUserById,
    removeUser,
    updateUser
} from "../services/admin.service.js";

import {getAllDepartments} from "../services/department.service.js";
import pool from "../config/db.js";
import * as profileService from "../services/profile.service.js";
import {getNotificationsByUserId} from "../services/notification.service.js";
import * as OfficerService from "../services/officer.service.js";
import {getServicesByDepartmentId} from "../dao/service.dao.js";

// Admin Dashboard
export const getAdminDashboard = async (req, res, next) => {
    try {
        const stats = await getDashboardStats();

        res.render("admin/dashboard", {
            layout: "layouts/admin_layout",
            title: "Admin Dashboard",
            user: req.user,
            stats
        });
    } catch (err) {
        next(err);
    }
};

export async function showUsers(req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE id != $1 ORDER BY id ASC",
            [req.user.id]
        );
        const users = result.rows;

        res.render("admin/users",
            {title: "Manage Users", users, layout: "layouts/admin_layout"});
    } catch (err) {
        res.status(500).send("Error loading users: " + err.message);
    }
}

export async function deleteUserController(req, res) {
    try {
        await removeUser(req.params.id);
        res.redirect("/admin/users");
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
}

export async function showUserController(req, res) {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        return user;
    } catch (err) {
        res.status(500).send("Error loading user: " + err.message);
    }
}

// Handle update form submission
export async function updateUserController(req, res) {
    try {
        const {name, email, role} = req.body;
        await updateUser(req.params.id, {name, email, role});
        res.redirect("/admin/users");
    } catch (err) {
        res.status(500).send("Error updating user: " + err.message);
    }
}

export async function showDepartments(req, res) {
    try {
        const departments = await getAllDepartments();
        res.render("admin/departments", {
            title: "Manage Departments",
            layout: "layouts/admin_layout",
            departments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
}

export const showGlobalSearch = async (req, res) => {
    try {
        const { q = "", status = "", from = "", to = "" } = req.query;

        // Fetch requests for officer's department
        const requests = await OfficerService.getRequests(req.user.department_id);

        // Fetch notifications for this officer
        const notifications = await getNotificationsByUserId(req.user.id);
        const services = getServicesByDepartmentId(req.user.id);


        res.render("admin/search", {
            layout: "layouts/admin_layout",
            title: "Search & Filter",
            requests,
            services,
            q,
            status,
            activePage: "dashboard",
            fromDate: from,
            toDate: to,
            user: req.user,
            notifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

export async function showReports(req, res) {
    try {
        const reports = await getReportsAdmin();
        res.render("admin/reports", {
            title: "Reports & Stats",
            layout: "layouts/admin_layout",
            reports: reports || []
        });
    } catch (err) {
        console.error("Error loading reports:", err);
        res.status(500).send("Error loading reports: " + err.message);
    }
}

export const getAdminProfile = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const profileData = await profileService.getProfileById(userId);

        const notifications = await getNotificationsByUserId(req.user.id);

        res.render("admin/profile", {
            title: "My Profile",
            user: profileData,
            layout: "layouts/admin_layout",
            notifications
        });
    } catch (err) {
        next(err);
    }
}


// POST update profile
export const updateAdminProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let { name, email ,date_of_birth, phone,national_id } = req.body;

        await profileService.updateProfile(userId, { name, email,date_of_birth, phone,national_id });
        res.redirect("/admin/profile");
    } catch (err) {
        next(err);
    }
};