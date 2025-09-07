import express from "express";
import {register,login,showRegisterPage,showLoginPage} from "../controller/user.controller.js";
const router = express.Router();

router.get("/register", showRegisterPage);
router.post("/register", register);

router.get("/login", showLoginPage);
router.post("/login", login);











export default router;