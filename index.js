import dotenv from "dotenv";
dotenv.config();

import cookieParser from 'cookie-parser';
import express from "express";
const app = express();
import UserRoutes from "./src/routes/user.routes.js";


const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//Citizens Routes
app.use("/api/users",UserRoutes)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})