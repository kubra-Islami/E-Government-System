import {registerUser, loginUser} from "../services/user.service.js";
import pool from "../config/db.js";

export const showRegisterPage = async (req, res) => {
    try {
        const { rows: departments } = await pool.query("SELECT id, name FROM departments");
        res.render("auth/register", {
            title: "Register",
            departments,
            hideSidebar:true
        });
    } catch (err) {
        res.render("auth/register", {
            title: "Register",
            departments: [],
            hideSidebar:true,
            error: "Could not load departments"
        });
    }
};

export const showLoginPage = (req, res) => {
    res.render("auth/login", {title: "Login", user: req.user, error: undefined,hideSidebar:true});
};

export const register = async (req, res) => {
    try {
        const {role, department_id} = req.body;
        if (role === "officer" && !department_id) {
            const { rows: departments } = await pool.query("SELECT id, name FROM departments");
            return res.status(400).render("auth/register", {
                title: "Register",
                error: "Department is required for officers.",
                departments,
            });
        }

        const { user, token } = await registerUser(req.body);
        res.cookie("token", token, { httpOnly: true });

        if (user.role === "citizen") return res.redirect("/citizen/dashboard");
        if (user.role === "officer") return res.redirect("/officer/dashboard");
        if (user.role === "admin") return res.redirect("/admin/dashboard");
        return res.redirect("/");

    } catch (err) {
        let departments = [];
        try {
            const { rows } = await pool.query("SELECT id, name FROM departments");
            departments = rows;
        } catch (e) {
            departments = [];
        }

        res.render("auth/register", {
            title: "Register",
            error: err.message,
            departments,
            hideSidebar: true,
        });
    }
};

export async function login(req, res) {
    try {
        const { user, token } = await loginUser({
            email: req.body.email,
            password: req.body.password
        });

        res.cookie("token", token, { httpOnly: true });
        req.user = user;


        // Redirect based on role
        if (user.role === "citizen") return res.redirect("/citizen/dashboard");
        if (user.role === "officer") return res.redirect("/officer/dashboard");
        if (user.role === "admin") return res.redirect("/admin/dashboard");
        return res.redirect("/");

    } catch (e) {
        res.render("auth/login", {
            title: "Login",
            user: null,
            error: e.message,
            hideSidebar: true,
        });
    }
}