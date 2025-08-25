import express from "express";
const router = express.Router();

router.get("/dashboard", (req, res) => {
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

router.get("/apply", (req, res) => {
    res.render("citizen/applyService", { title: "Apply for Service", departments, services});
});

router.get("/requests", (req, res) => {
    res.render("citizen/requests", { title: "My Applications",requests });
});

router.get("/payments", (req, res) => {
    res.render("citizen/payments", { title: "Payments" });
});

router.get("/profile", (req, res) => {
    res.render("citizen/profile", { title: "Profile" });
});

router.get("/notifications", (req, res) => {
    res.render("citizen/notifications", { title: "Notifications" });
});

export default router;
