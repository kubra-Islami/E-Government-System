import express from "express";
import * as NotificationController from "../controller/notification.controller.js";
import { getNotificationsByUserId } from "../services/notification.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as NotificationService from "../services/notification.service.js";

const router = express.Router();

// all users must be logged in
router.use(authMiddleware);

router.get("/", async (req, res) => {
    if (!req.user) return res.redirect("/api/users/login");

    const notifications = await getNotificationsByUserId(req.user.id);
    await NotificationService.markNotificationRead(req.params.id, req.user.id);

    res.render("notifications/index", {
        title: "My Notifications",
        layout: `layouts/${req.user.role}_layout`,
        notifications,
        user: req.user,
    });
});



// Mark one notification as read
router.post("/:id/read", NotificationController.markAsRead);

// Mark all as read
router.post("/read-all", NotificationController.markAllAsRead);

export default router;
