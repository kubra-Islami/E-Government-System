import express from "express";
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("citizen/dashboard", { title: "Officer Dashboard", user: req.user,requests :[] });
});

export default router;
