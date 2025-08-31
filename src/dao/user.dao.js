import pool from "../config/db.js";
import User from "../models/User.js";

export async function createUser(data) {
    const {
        name, email, password, national_id, date_of_birth, contact_info, role, department_id = null,
    } = data;

    const sql = `
        INSERT INTO users (name, email, password, national_id, date_of_birth, contact_info, role, department_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *;
    `;
    const params = [name, email, password, national_id, date_of_birth, contact_info, role, department_id];
    const { rows } = await pool.query(sql, params);
    return new User(rows[0]);
}

export async function findByEmail(email) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return rows[0] ? new User(rows[0]) : null;
}

export async function findById(id) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    return rows[0] ? new User(rows[0]) : null;
}


export const getUserByIdDao = async (userId) => {
    const sql = `
        SELECT id, name, email, national_id, date_of_birth, contact_info, phone, role, department_id, avatar
        FROM users
        WHERE id = $1
    `;
    const { rows } = await pool.query(sql, [userId]);
    return rows[0] || null;
};

