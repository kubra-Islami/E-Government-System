import pool from "../config/db.js";
import Request from "../models/Request.js";

export const addRequestDao = async ({ citizen_id, service_id }) => {
    const sql = `INSERT INTO requests (citizen_id, service_id) 
                 VALUES ($1, $2) RETURNING *`;
    const params = [citizen_id, service_id];
    const { rows } = await pool.query(sql, params);
    return rows[0];
};

export async function getAllRequestsDao(){
    const result = await pool.query(`
            SELECT s.id, s.name, s.fee, d.name as department
            FROM services s
            JOIN departments d ON s.department_id = d.id
            ORDER BY s.id ASC
        `);
    return result.rows;
}

export const getRequestsByCitizenId = async (citizenId) => {
    const sql = `
        SELECT r.id,
               r.citizen_id,
               r.service_id,
               r.status,
               r.created_at,
               r.updated_at,
               r.reviewed_by,
               s.name AS service_name,
               d.name AS department_name,
               u.name AS reviewer_name  
        FROM requests r
        JOIN services s ON r.service_id = s.id
        JOIN departments d ON s.department_id = d.id
        LEFT JOIN users u ON r.reviewed_by = u.id
        WHERE r.citizen_id = $1
        ORDER BY r.created_at DESC
    `;
    const { rows } = await pool.query(sql, [citizenId]);
    return rows.map(row => new Request(row));
};
