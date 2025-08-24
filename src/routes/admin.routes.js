import express from "express";

const router = express.Router();
import {getAdminDashboard} from "../controller/admin.controller.js";

router.get("/dashboard",getAdminDashboard);


export default router;
