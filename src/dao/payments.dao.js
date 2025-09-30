import pool from "../config/db.js";

export const addPaymentDao = async ({ request_id, amount, status }) => {
    const sql = `
        INSERT INTO payments (request_id, amount, status)
        VALUES ($1, $2, $3)
            RETURNING *
    `;
    const params = [request_id, amount, status];
    const { rows } = await pool.query(sql, params);
    return rows[0];
};


export const getPaymentByIdDB = async (paymentId) => {
    const result = await pool.query(
        `SELECT p.*, s.name AS service_name, d.name AS department_name
     FROM payments p
     JOIN requests r ON r.id = p.request_id
     JOIN services s ON s.id = r.service_id
     JOIN departments d ON d.id = s.department_id
     WHERE p.id = $1`,
        [paymentId]
    );
    return result.rows[0];
};