import express from "express";
const router = express.Router();
import {authMiddleware} from "../middlewares/auth.middleware.js";



router.get("/dashboard",authMiddleware, (req, res) => {
    res.render("citizen/dashboard", { title: "Citizen Dashboard", user: req.user});
});

const departments = [
    { id: 1, name: "Interior" },
    { id: 2, name: "Commerce" }
];
const requests = [
    { id: 1, service_name: "Interior" , status :"Approved" ,created_at :"2024-24-8" },
    { id: 2, service_name: "Commerce" , status :"Approved" ,created_at :"2024-24-8" }
];

const services = [
    { id: 1, name: "Passport Renewal" },
    { id: 2, name: "Business License" }
];

router.get("/apply",authMiddleware, (req, res) => {
    res.render("citizen/applyService", { title: "Apply for Service", departments, services});
});

router.get("/requests",authMiddleware, (req, res) => {
    res.render("citizen/requests", { title: "My Applications",requests });
});

router.get("/payments",authMiddleware, (req, res) => {
    res.render("citizen/payments", { title: "Payments",department:{ id: 1, name: "Interior" },service : { id: 1, name: "Passport Renewal",fee:"120" }, });
});

router.get("/profile",authMiddleware, (req, res) => {
    res.render("citizen/profile", { title: "Profile",user: req.user, recentActivities:[{id:1, description:"Profile",date:2024-24-8},{id:2, description:"Profile 2",date:2024-30-12},] }) ;
});

router.get("/notifications",authMiddleware, (req, res) => {
    res.render("citizen/notifications", { title: "Notifications" });
});

export default router;
