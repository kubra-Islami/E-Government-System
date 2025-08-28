import dotenv from "dotenv";

dotenv.config();

import cookieParser from 'cookie-parser';
import express from "express";
import path from "path";
import {fileURLToPath} from "url";
import expressLayouts from "express-ejs-layouts";
import {verifyToken} from "./src/utils/token.util.js";

import UserRoutes from "./src/routes/user.routes.js";
import AdminRoutes from "./src/routes/admin.routes.js";
import CitizenRoutes from "./src/routes/citizen.routes.js";
import OfficerRoutes from "./src/routes/officer.routes.js";
import {requireAdmin} from "./src/middlewares/auth.requireAdmin.js";
import {findById} from "./src/dao/user.dao.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(async (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = verifyToken(token);
            const fullUser = await findById(decoded.id);
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
app.use(express.urlencoded({extended: true}));

app.use(expressLayouts);
app.set("layout", "layouts/layout");

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/users", UserRoutes);
app.use("/admin", requireAdmin, AdminRoutes);
app.use("/officer", OfficerRoutes);
app.use("/citizen", CitizenRoutes);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
