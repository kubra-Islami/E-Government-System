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
    return rows.map(row => new Request(row));
};

export async function getRequestsForDepartment(
    {
        departmentId,
        status,
        search,
        page = 1,
        limit = 20,
        fromDate,
        toDate
    }) {
    const offset = (page - 1) * limit;
    const values = [departmentId];
    let idx = 2;

    let where = `WHERE d.id = $1`;

    if (status) {
        where += ` AND r.status = $${idx++}`;
        values.push(status);
    }
    if (search) {
        where += ` AND (u.name ILIKE $${idx} OR CAST(r.id AS TEXT) = $${idx + 1})`;
        values.push(`%${search}%`, search);
        idx += 2;
    }
    if (fromDate) {
        where += ` AND r.created_at >= $${idx++}`;
        values.push(fromDate);
    }
    if (toDate) {
        where += ` AND r.created_at <= $${idx++}`;
        values.push(toDate);
    }

    const sql = `
        SELECT r.id,
               r.request_number,
               r.status,
               r.created_at,
               r.updated_at,
               u.name AS citizen_name,
               s.name AS service_name,
               d.name AS department_name
        FROM requests r
                 JOIN services s ON r.service_id = s.id
                 JOIN departments d ON s.department_id = d.id
                 JOIN users u ON r.citizen_id = u.id
            ${where}
        ORDER BY r.created_at DESC
            LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);
    try {
        const { rows } = await pool.query(sql, values);
        console.log('rows', rows);
        return rows;
    } catch (err) {
        console.error('SQL ERROR:', err.message);
        console.error('SQL QUERY:', sql);
        console.error('SQL VALUES:', values);
        throw err;
    }
}


export async function getRequestById(id) {
    const { rows } = await pool.query(`
    SELECT r.*, s.name AS service_name, u.name AS citizen_name, u.email AS citizen_email
    FROM requests r
    JOIN services s ON r.service_id = s.id
    JOIN users u ON r.citizen_id = u.id
    WHERE r.id = $1
  `, [id]);
    return rows[0];
}

export async function updateRequestStatus({ id, status, officer_id, officer_comment }) {
    const { rows } = await pool.query(`
    UPDATE requests
    SET status = $1, assigned_officer_id = $2, officer_comment = $3, updated_at = now()
    WHERE id = $4
    RETURNING *
  `, [status, officer_id, officer_comment, id]);
    return rows[0];
}

export async function getDocumentsByRequestId(requestId) {
    const { rows } = await pool.query(`SELECT * FROM documents WHERE request_id = $1`, [requestId]);
    return rows;
}