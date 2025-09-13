import db from "../config/db.js";

// Fetch all notifications for a user
export const fetchNotificationsByUserId = async (userId) => {
    const { rows } = await db.query(
        `SELECT id, request_id, message, channel, is_read, created_at
         FROM public.notifications
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};


// Mark a notification as read
export const markNotificationRead = async (notificationId, userId) => {
    const { rows } = await db.query(
        `UPDATE notifications
             SET is_read = TRUE, updated_at = NOW()
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
        [notificationId, userId]
    );
    return rows[0];
};


export const markAllNotificationsRead = async (userId) => {
    const { rows } = await db.query(
        `UPDATE public.notifications
         SET is_read = TRUE, updated_at = NOW()
         WHERE user_id = $1
         RETURNING *`,
        [userId]
    );
    return rows;
};

export const createNotification = async (user_id, request_id, message, channel = "in_app") => {
    const { rows } = await db.query(
        `INSERT INTO notifications (user_id, request_id, message, channel)
         VALUES ($1, $2, $3, $4)
             RETURNING *`,
        [user_id, request_id, message, channel]
    );
    return rows[0];
};
