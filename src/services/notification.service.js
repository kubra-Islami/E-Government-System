import * as notificationDAO from "../dao/notification.dao.js";

// Get all notifications for a user
export const getNotificationsByUserId = async (userId) => {
    return await notificationDAO.fetchNotificationsByUserId(userId);
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
    return await notificationDAO.markNotificationRead(notificationId, userId);
};

// Add new notification
export const addNotification = async (userId, message) => {
    return await notificationDAO.createNotification(userId, message);
};
