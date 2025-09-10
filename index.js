import dotenv from "dotenv";
dotenv.config();

import cookieParser from 'cookie-parser';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import { verifyToken } from "./src/utils/token.util.js";

import UserRoutes from "./src/routes/user.routes.js";
import AdminRoutes from "./src/routes/admin.routes.js";
import CitizenRoutes from "./src/routes/citizen.routes.js";
import OfficerRoutes from "./src/routes/officer.routes.js";
import { requireAdmin } from "./src/middlewares/auth.requireAdmin.js";
import { getUserByIdDao } from "./src/dao/user.dao.js";
import { createServer } from "http";
import { Server } from "socket.io";
import res from "express/lib/response.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Make io available in routes/services
app.set("io", io);

// Middleware: attach user info from token
app.use(cookieParser());
app.use(async (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = verifyToken(token);
            const fullUser = await getUserByIdDao(decoded.id);
            res.locals.user = fullUser;
            req.user = fullUser;
        } catch (err) {
            res.locals.user = null;
            req.user = null;
        }
    } else {
        res.locals.user = null;
        req.user = null;
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// EJS and Layouts
app.use(expressLayouts);
// Remove global layout setting since we now use role-specific layouts
// app.set("layout", "layouts/layout");

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/users", UserRoutes);
app.use("/admin", requireAdmin, AdminRoutes);
// app.use("/officer", OfficerRoutes);
app.use("/citizen", CitizenRoutes);
app.use("/logout", async (req, res) => {
    res.redirect("/api/users/login");
});
app.use("/officer", async (req, res, next) => {
    try {
        if (req.user && req.user.role === "officer") {
            const { rows } = await pool.query(
                "SELECT * FROM notifications WHERE officer_id = $1 ORDER BY created_at DESC",
                [req.user.id]
            );
            res.locals.notifications = rows;
        } else {
            res.locals.notifications = [];
        }
    } catch (err) {
        res.locals.notifications = [];
    }
    next();
},OfficerRoutes);



// Socket.io
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join private room for notifications
    socket.on("registerUser", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
