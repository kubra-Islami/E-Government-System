import express from "express";
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("officer/dashboard", { title: "Officer Dashboard", user: req.user });
});

export default router;
