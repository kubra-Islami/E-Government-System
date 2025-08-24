import express from "express";
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("citizen/dashboard", { title: "Citizen Dashboard", user: req.user});
});

export default router;
