import * as notificationDAO from "../dao/notification.dao.js";

// Get all notifications for a user
export const getNotificationsByUserId = async (userId) => {
    return await notificationDAO.fetchNotificationsByUserId(userId);
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
    return await notificationDAO.markNotificationRead(notificationId, userId);
};

// Add new notification and emit it
export const addNotification = async (req, userId, message) => {
    const notification = await notificationDAO.createNotification(userId, message);

    // Emit via Socket.IO
    const io = req.app.get("io");
    io.to(`user_${userId}`).emit("notification", notification);

    return notification;
};


