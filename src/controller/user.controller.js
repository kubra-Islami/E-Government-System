import {registerUser,loginUser} from "../services/user.service.js";

export const showRegisterPage = (req, res) => {
    res.render("auth/register",{ title: "Register" ,user: null,error: undefined });
};

export const showLoginPage = (req, res) => {
    res.render("auth/login",{ title: "Login",user: req.user,error: undefined });
};

export const register = async (req, res) => {
    try {
        const {user, token} = await registerUser(req.body);

        res.cookie("token", token, { httpOnly: true });

        // Redirect based on role
        // Redirect based on role
        if (user.role === "citizen") return res.redirect("/citizen/dashboard");
        if (user.role === "officer") return res.redirect("/officer/dashboard");
        if (user.role === "admin") return res.redirect("/admin/dashboard");
        return res.redirect("/");


    } catch (err) {
        // res.status(500).json({
        //     status: "failed to register.ejs",
        //     error: {
        //         message: err.message
        //     }
        // })
        res.render("auth/register", { title: "Register", user: null, error: err.message });


    }
}

export async function login(req, res, next) {
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
        res.render("auth/login", { title: "Login", user: null, error: e.message });

        next(e);
    }
}
