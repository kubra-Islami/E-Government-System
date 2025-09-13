import Request from "../models/Request.js";
import db from "../config/db.js";

// export const addRequestDao = async ({ citizen_id, service_id }) => {
//     const sql = `INSERT INTO requests (citizen_id, service_id)
//                  VALUES ($1, $2) RETURNING *`;
//     const params = [citizen_id, service_id];
//     const { rows } = await db.query(sql, params);
//     return rows[0];
// };



export async function getStatsResult(citizenId) {
    const result = await db.query(
        `SELECT
             COUNT(r.*) AS total_requests,
             COUNT(*) FILTER (WHERE r.status IN ('submitted', 'under_review')) AS pending_requests,
                 COALESCE(SUM(p.amount), 0) AS total_payments
         FROM requests r
                  LEFT JOIN payments p ON r.id = p.request_id
         WHERE r.citizen_id = $1`,
        [citizenId]
    );
    return result.rows;
}



export async function getAllRequestsDao(){
    const result = await db.query(`
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
    const { rows } = await db.query(sql, [request_id]);
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
               COALESCE(r.status, 'submitted') AS status, 
               r.created_at,
               r.updated_at,
               r.first_reviewer_id,
               r.first_review_comment,
               r.first_reviewed_at,
               r.final_reviewer_id,
               r.final_comment,
               r.final_reviewed_at,
               s.name AS service_name,
               s.fee AS service_fee,
               d.name AS department_name,
               fu.name AS first_reviewer_name,
               fv.name AS final_reviewer_name
        FROM requests r
                 JOIN services s ON r.service_id = s.id
                 JOIN departments d ON s.department_id = d.id
                 LEFT JOIN users fu ON r.first_reviewer_id = fu.id
                 LEFT JOIN users fv ON r.final_reviewer_id = fv.id
        WHERE r.citizen_id = $1
        ORDER BY r.created_at DESC
    `;
    const { rows } = await db.query(sql, [citizenId]);
    return rows.map(row => new Request(row));
};



export const getOfficerDepartmentId = async (officerId) => {
    const sql = `
        SELECT department_id
        FROM users
        WHERE id = $1 AND role = 'officer'
    `;
    const { rows } = await db.query(sql, [officerId]);
    return rows.length ? rows[0].department_id : null;
};

export async function addRequestDao({ citizen_id, service_id, status, form_data }) {
    const query = `
    INSERT INTO requests (citizen_id, service_id, status, form_data, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *;
  `;
    const values = [citizen_id, service_id, status, form_data];
    const result = await db.query(query, values);
    return result.rows[0];
}

export async function addDocumentDao({ request_id, file_path, original_name }) {
    const query = `
    INSERT INTO documents (request_id, file_path, original_name, uploaded_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *;
  `;
    const values = [request_id, file_path, original_name];
    const result = await db.query(query, values);
    return result.rows[0];
}

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
        const { rows } = await db.query(sql, values);
        return rows;
    } catch (err) {
        throw err;
    }
}


export async function getRequestById(requestId) {
    const { rows } = await db.query(`
        SELECT
            r.*,
            s.name AS service_name,
            d.id AS department_id,
            d.name AS department_name,
            u.name AS citizen_name,
            u.email AS citizen_email
        FROM requests r
                 JOIN services s ON r.service_id = s.id
                 JOIN departments d ON s.department_id = d.id
                 JOIN users u ON r.citizen_id = u.id
        WHERE r.id = $1
    `, [requestId]);
    return rows[0];
}


export async function getRequestsByDepartment(departmentId) {
    const { rows } = await db.query(`
        SELECT r.id, r.status, u.name AS citizen_name, u.email AS citizen_email, s.name AS service_name
        FROM requests r
                 JOIN users u ON r.citizen_id = u.id
                 JOIN services s ON r.service_id = s.id
        WHERE s.department_id = $1
        ORDER BY r.created_at DESC
    `, [departmentId]);

    return rows;
}

export async function updateRequestStatus({ id, status, first_reviewer_id, first_review_comment, first_reviewed_at, final_reviewer_id, final_comment, final_reviewed_at }) {
    const { rows } = await db.query(`
        UPDATE requests
        SET status = $1,
            first_reviewer_id = COALESCE($2, first_reviewer_id),
            first_review_comment = COALESCE($3, first_review_comment),
            first_reviewed_at = COALESCE($4, first_reviewed_at),
            final_reviewer_id = COALESCE($5, final_reviewer_id),
            final_comment = COALESCE($6, final_comment),
            final_reviewed_at = COALESCE($7, final_reviewed_at),
            updated_at = now()
        WHERE id = $8
            RETURNING *
    `, [status, first_reviewer_id, first_review_comment, first_reviewed_at, final_reviewer_id, final_comment, final_reviewed_at, id]);

    return rows[0];
}

export async function getDocumentsByRequestId(requestId) {
    const { rows } = await db.query(`SELECT * FROM documents WHERE request_id = $1`, [requestId]);
    return rows;
}

export const markUnderReview = async ({ requestId, officerId }) => {
    const sql = `
        UPDATE requests
        SET first_reviewer_id = $1,
            status = 'under_review',
            updated_at = NOW()
        WHERE id = $2
        RETURNING *
    `;
    const { rows } = await db.query(sql, [officerId, requestId]);
    return rows[0];
};

export const finalizeRequest = async ({ requestId, officerId, action, comment }) => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const sql = `
        UPDATE requests
        SET final_reviewer_id = $1,
            final_comment = $2,
            status = $3,
            final_reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = $4
        RETURNING *
    `;
    const { rows } = await db.query(sql, [officerId, comment, newStatus, requestId]);
    return rows[0];
};
