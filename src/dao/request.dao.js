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

export async function getRequestByIdDao(request_id){
    const sql = `
        SELECT r.id AS request_id,
               r.citizen_id,
               r.service_id,
               r.status,
               r.created_at,
               r.updated_at,
               s.id AS service_id,
               s.name AS service_name,
               s.fee AS service_fee,
               d.id AS department_id,
               d.name AS department_name
        FROM requests r
        JOIN services s ON r.service_id = s.id
        JOIN departments d ON s.department_id = d.id
        WHERE r.id = $1
    `;
    const { rows } = await pool.query(sql, [request_id]);
    if (!rows[0]) return null;

    return {
        id: rows[0].request_id,
        status: rows[0].status,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at,
        service: {
            id: rows[0].service_id,
            name: rows[0].service_name,
            fee: rows[0].service_fee
        },
        department: {
            id: rows[0].department_id,
            name: rows[0].department_name
        }
    };
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
               s.fee AS service_fee,      
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

    console.log('rows')
    console.log(rows)
    return rows.map(row => new Request(row));
};
