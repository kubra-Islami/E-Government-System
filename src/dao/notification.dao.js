import db from "../config/db.js";

// Fetch all notifications for a user
export const fetchNotificationsByUserId = async (userId) => {
    const result = await db.query(
        `SELECT id, user_id, request_id, message, channel, is_read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
};

// Mark a notification as read
export const markNotificationRead = async (notificationId, userId) => {
    const result = await db.query(
        `UPDATE notifications
         SET read = TRUE
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
    );
    return result.rows[0];
};

// Create a notification
// export const createNotification = async (userId, message) => {
//     const result = await db.query(
//         `INSERT INTO notifications (user_id, message)
//          VALUES ($1, $2) RETURNING *`,
//         [userId, message]
//     );
//     return result.rows[0];
// };


export const createNotification = async ({ user_id, title, message, link }) => {
    const { rows } = await pool.query(`
        INSERT INTO notifications (user_id, title, message, link)
        VALUES ($1, $2, $3, $4)
            RETURNING *
    `, [user_id, title, message, link]);

    return rows[0];
};
