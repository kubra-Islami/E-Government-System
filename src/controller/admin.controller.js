import {
    fetchReports,
    getDashboardStats,
    getUserById,
    listUsers,
    removeUser,
    updateUser
} from "../services/admin.service.js";
import {getAllDepartments} from "../dao/department.dao.js";
import {getAllServices} from "../dao/service.dao.js";

// Admin Dashboard
export const getAdminDashboard = async (req, res, next) => {
    try {
        const stats = await getDashboardStats();
        res.render("admin/dashboard", {
            title: "Admin Dashboard",
            user: req.user,
            stats
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

// Manage Users
export async function showUsers(req, res) {
    try {
        const users = await listUsers();
        res.render("admin/users", { title: "Manage Users", users });
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

export async function editUserController(req, res) {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        return user;
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading user: " + err.message);
    }
}

// Handle update form submission
export async function updateUserController(req, res) {
    try {
        const { name, email, role } = req.body;
        await updateUser(req.params.id, { name, email, role });
        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user: " + err.message);
    }
}

// Reports
export async function showReports(req, res) {
    try {
        const reports = await fetchReports();
        res.render("admin/reports", { title: "Reports", reports });
    } catch (err) {
        res.status(500).send("Error loading reports: " + err.message);
    }
}

export async function showDepartments (req, res) {
    try {
        const departments = await getAllDepartments();
        res.render("admin/departments", {
            title: "Manage Departments",
            departments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
}

export const showServices = async (req, res) => {
    try {
        const services = await getAllServices();

        res.render("admin/services", {
            title: "Manage Services",
            services
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

// Search all requests, users, and services
import { globalSearchUsers, globalSearchServices, globalSearchRequests } from "../services/admin.service.js";

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

