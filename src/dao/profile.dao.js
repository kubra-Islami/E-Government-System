import db from "../config/db.js";
import pool from "../config/db.js";

export const fetchProfile = async (userId) => {
    const result = await db.query(
        `SELECT id, name, national_id, date_of_birth, email, phone, avatar,role
     FROM users
     WHERE id = $1`,
        [userId]
    );
    return result.rows[0];
};

export const fetchRecentActivities = async (userId) => {
    const sql = await db.query(
        `SELECT description, to_char(created_at, 'YYYY-MM-DD HH24:MI') AS date
         FROM activities
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [userId]
    );
    return sql.rows;
};

export const updateProfile = async (userId, updates) => {
    const fields = [];
    const values = [];
    let i = 1;

    for (let key in updates) {
        fields.push(`${key} = $${i}`);
        values.push(updates[key]);
        i++;
    }

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${i}`;
    await db.query(query, values);
};
