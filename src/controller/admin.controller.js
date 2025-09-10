import {
    getDashboardStats,
    getUserById,
    removeUser,
    updateUser
} from "../services/admin.service.js";


// Search all requests, users, and services
import {globalSearchUsers, globalSearchServices, globalSearchRequests} from "../services/admin.service.js";
import {getAllDepartments} from "../services/department.service.js";
import pool from "../config/db.js";
import * as profileService from "../services/profile.service.js";
import {getNotificationsByUserId} from "../services/notification.service.js";

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

// Reports
export async function showReports(req, res) {
    try {
        // const reports = await fetchReports();
        res.render("admin/reports", {title: "Reports", reports: [], layout: "layouts/admin_layout",});
    } catch (err) {
        res.status(500).send("Error loading reports: " + err.message);
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
        const searchQuery = req.query.q ? req.query.q.trim() : "";

        let users = [];
        let services = [];
        let requests = [];

        if (searchQuery) {
            users = await globalSearchUsers(searchQuery);
            services = await globalSearchServices(searchQuery);
            requests = await globalSearchRequests(searchQuery);
        }

        res.render("admin/search", {
            title: "Global Search",
            layout: "layouts/admin_layout",
            users,
            services,
            requests,
            searchQuery
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};


export const getAdminProfile = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const profileData = await profileService.getProfileById(userId);
        const recentActivities = await profileService.getRecentActivities(userId);

        const notifications = await getNotificationsByUserId(req.user.id);

        res.render("citizen/profile", {
            title: "My Profile",
            user: profileData,
            layout: "layouts/admin_layout",
            recentActivities: recentActivities,
            notifications
        });
    } catch (err) {
        next(err);
    }
}
