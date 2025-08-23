import dotenv from "dotenv";
dotenv.config();

import cookieParser from 'cookie-parser';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import UserRoutes from "./src/routes/user.routes.js";
import AdminRoutes from "./src/routes/admin.routes.js";
import OfficerRoutes from "./src/routes/officer.routes.js";
import CitizenRoutes from "./src/routes/officer.routes.js";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set("layout", "layouts/layout");

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/api/users",UserRoutes)
app.use("/admin", AdminRoutes);
app.use("/officer", OfficerRoutes);
app.use("/citizen", CitizenRoutes);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})