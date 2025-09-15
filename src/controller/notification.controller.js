import * as NotificationService from "../services/notification.service.js";

// Render notifications page
export const getNotificationsPage = async (req, res, next) => {
    try {
        const notifications = await NotificationService.getNotificationsByUserId(req.user.id);
        res.render("citizen/notifications", { title: "Notifications", notifications , layout: "layouts/citizen_layout",user: req.user});
    } catch (err) {
        next(err);
    }
};

// Mark single notification as read
export const markNotificationRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        await NotificationService.markAsRead(id, req.user.id);
        res.redirect("/citizen/notifications");
    } catch (err) {
        next(err);
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await NotificationService.getNotificationsByUserId(req.user.id);
        res.render("notifications/index", {
            title: "My Notifications",
            layout: "layouts/" + req.user.role + "_layout",
            notifications,
            user: req.user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching notifications");
    }
};

export const markAsRead = async (req, res) => {
    try {
        await NotificationService.markNotificationRead(req.params.id, req.user.id);
        res.redirect("/notifications");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error marking notification as read");
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await NotificationService.markAllNotificationsRead(req.user.id);
        res.redirect("/notifications");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error marking all notifications as read");
    }
};
