import express from "express";

const router = express.Router();
import {getAdminDashboard} from "../controller/admin.controller.js";


const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).send("Access denied");
    }
    console.log(req.user.role);
    next();
};
router.get("/dashboard",getAdminDashboard);


export default router;
