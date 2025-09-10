import * as notificationService from "../services/notification.service.js";

// Render notifications page
export const getNotificationsPage = async (req, res, next) => {
    try {
        const notifications = await notificationService.getNotificationsByUserId(req.user.id);
        res.render("citizen/notifications", { title: "Notifications", notifications , layout: "layouts/citizen_layout",});
    } catch (err) {
        next(err);
    }
};

// Mark single notification as read
export const markNotificationRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id, req.user.id);
        res.redirect("/citizen/notifications");
    } catch (err) {
        next(err);
    }
};
