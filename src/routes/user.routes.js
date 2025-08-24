import express from "express";
import {register,login,showRegisterPage,showLoginPage} from "../controller/user.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/register", showRegisterPage);
router.post("/register", register);

router.get("/login", showLoginPage);
router.post("/login", login);











export default router;