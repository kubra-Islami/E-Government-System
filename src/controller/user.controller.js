import {registerUser, loginUser} from "../services/user.service.js";
import pool from "../config/db.js";

export const showRegisterPage = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name FROM departments");
        res.render("auth/register", {
            title: "Register",
            user: null,
            error: undefined,
            departments: result.rows,
        });
    } catch (err) {
        res.status(500).render("error", {
            title: "Error",
            message: "Failed to load register form.",
        });
    }
};


export const showLoginPage = (req, res) => {
    res.render("auth/login", {title: "Login", user: req.user, error: undefined});
};

export const register = async (req, res) => {
    try {
        const {role, department_id} = req.body;
        if ((role === "officer" || role === "admin") && !department_id) {
            return res
                .status(400)
                .render("auth/register", {
                    title: "Register",
                    user: null,
                    error: "Department is required for officers and admins."
                });
        }

        const {user, token} = await registerUser(req.body);
        res.cookie("token", token, {httpOnly: true});

        if (user.role === "citizen") return res.redirect("/citizen/dashboard");
        if (user.role === "officer") return res.redirect("/officer/dashboard");
        if (user.role === "admin") return res.redirect("/admin/dashboard");
        return res.redirect("/");


    } catch (err) {
        res.render("auth/register", {title: "Register", user: null, error: err.message});
    }
}

export async function login(req, res) {
    try {
        const { user, token } = await loginUser({
            email: req.body.email,
            password: req.body.password,
        });

        res.cookie("token", token, { httpOnly: true });

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
        });
    }
}

