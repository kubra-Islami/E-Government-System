import { fetchReports, getDashboardStats, listUsers, removeUser } from "../services/admin.service.js";
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