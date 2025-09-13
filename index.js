import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import { verifyToken } from "./src/utils/token.util.js";

import UserRoutes from "./src/routes/user.routes.js";
import AdminRoutes from "./src/routes/admin.routes.js";
import CitizenRoutes from "./src/routes/citizen.routes.js";
import OfficerRoutes from "./src/routes/officer.routes.js";
import notificationsRouter from "./src/routes/notifications.routes.js";

import { requireAdmin } from "./src/middlewares/auth.requireAdmin.js";
import { getUserByIdDao } from "./src/dao/user.dao.js";
import { fetchNotificationsByUserId } from "./src/dao/notification.dao.js";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Make io available in routes/services
app.set("io", io);

// --------------------
// Middleware: attach user from token
// --------------------
app.use(cookieParser());
app.use(async (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = verifyToken(token);
            const fullUser = await getUserByIdDao(decoded.id);
            res.locals.user = fullUser;
            req.user = fullUser;

            // 🔔 fetch notifications globally
            if (fullUser) {
                res.locals.notifications = await fetchNotificationsByUserId(fullUser.id);
            } else {
                res.locals.notifications = [];
            }
        } catch (err) {
            res.locals.user = null;
            res.locals.notifications = [];
            req.user = null;
        }
    } else {
        res.locals.user = null;
        res.locals.notifications = [];
        req.user = null;
    }
    next();
});

// --------------------
// Middleware / static
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));


// --------------------
// EJS and Layouts
// --------------------
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --------------------
// Routes
// --------------------


// Citizen
app.use("/citizen/notifications", (req, res, next) => {
    if (req.user?.role === "citizen") return next();
    return res.status(403).send("Forbidden");
}, notificationsRouter);

// Officer
app.use("/officer/notifications", (req, res, next) => {
    if (req.user?.role === "officer") return next();
    return res.status(403).send("Forbidden");
}, notificationsRouter);

// Admin
app.use("/admin/notifications", (req, res, next) => {
    if (req.user?.role === "admin") return next();
    return res.status(403).send("Forbidden");
}, notificationsRouter);

app.get("/notifications", (req, res) => {
    if (!req.user) return res.redirect("/api/users/login");

    switch (req.user.role) {
        case "citizen":
            return res.redirect("/citizen/notifications");
        case "officer":
            return res.redirect("/officer/notifications");
        case "admin":
            return res.redirect("/admin/notifications");
        default:
            return res.status(403).send("Forbidden");
    }
});

app.use("/api/users", UserRoutes);
app.use("/admin", requireAdmin, AdminRoutes);
app.use("/citizen", CitizenRoutes);
app.use("/officer", OfficerRoutes);

app.use("/logout", async (req, res) => {
    res.clearCookie("token");
    res.redirect("/api/users/login");
});

// --------------------
// Socket.io
// --------------------
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Each user joins a private room
    socket.on("registerUser", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// --------------------
// Start server
// --------------------
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
