import db from "../config/db.js";

export const findRequestsByDepartment = async (departmentId) => {
    const { rows } = await db.query(
        `SELECT r.id,
                r.status,
                r.created_at,
                s.name AS service_name,
                d.name AS department_name,
                u.name AS citizen_name
         FROM requests r
                  JOIN services s ON r.service_id = s.id
                  JOIN departments d ON s.department_id = d.id
                  JOIN users u ON r.citizen_id = u.id
         WHERE d.id = $1
         ORDER BY r.created_at DESC;`,
        [departmentId]
    );
    return rows;
};

export const findRequestById = async (requestId) => {
    const { rows } = await db.query(
        `SELECT r.*, u.name AS citizen_name, s.name AS service_name
     FROM requests r
     JOIN users u ON r.citizen_id = u.id
     JOIN services s ON r.service_id = s.id
     WHERE r.id = $1`,
        [requestId]
    );
    return rows[0];
};

export const updateRequestStatus = async (requestId, status, officerId, comment) => {
    let query, params;

    if (status === 'under_review') {
        query = `
            UPDATE requests
            SET status = $1,
                first_reviewer_id = $2,
                first_review_comment = $3,
                first_reviewed_at = NOW(),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *`;
        params = [status, officerId, comment, requestId];
    } else if (status === 'approved' || status === 'rejected') {
        query = `
            UPDATE requests
            SET status = $1,
                final_reviewer_id = $2,
                final_comment = $3,
                final_reviewed_at = NOW(),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *`;
        params = [status, officerId, comment, requestId];
    } else {
        // fallback, just update status
        query = `
            UPDATE requests
            SET status = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING *`;
        params = [status, requestId];
    }

    const { rows } = await pool.query(query, params);
    return rows[0];
};



export const assignRequest = async (requestId, officerId) => {
    const { rows } = await db.query(
        `UPDATE requests
         SET first_reviewer_id = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [officerId, requestId]
    );
    return rows[0];
};

// --- Notes ---
export const addNote = async (requestId, officerId, note) => {
    const { rows } = await db.query(
        `INSERT INTO request_notes (request_id, officer_id, note)
     VALUES ($1, $2, $3)
     RETURNING *`,
        [requestId, officerId, note]
    );
    return rows[0];
};

export const getNotes = async (requestId) => {
    const { rows } = await db.query(
        `SELECT rn.*, u.name AS officer_name
     FROM request_notes rn
     JOIN users u ON rn.officer_id = u.id
     WHERE rn.request_id = $1
     ORDER BY rn.created_at DESC`,
        [requestId]
    );
    return rows;
};

// --- Documents ---
export const addDocument = async (requestId, filename, filepath) => {
    const { rows } = await db.query(
        `INSERT INTO documents (request_id, filename, filepath)
     VALUES ($1, $2, $3)
     RETURNING *`,
        [requestId, filename, filepath]
    );
    return rows[0];
};

export const findById = async (id) => {
    const { rows } = await db.query(
        `SELECT u.id, u.name, u.email, u.role, d.name AS department_name
         FROM users u
                  LEFT JOIN departments d ON u.department_id = d.id
         WHERE u.id = $1;`,
        [id]
    );
    return rows[0];
};


export const findDocumentById = async (documentId) => {
    const { rows } = await db.query(
        `SELECT * FROM documents WHERE id = $1`,
        [documentId]
    );
    return rows[0];
};
// officer.dao.js
import pool from "../config/db.js";

// For first review
export async function markUnderReview(requestId, officerId, comment) {
    await pool.query(
        `UPDATE requests
         SET status = 'under_review',
             first_reviewer_id = $1,
             first_review_comment = $2,
             first_reviewed_at = NOW(),
             updated_at = NOW()
         WHERE id = $3`,
        [officerId, comment, requestId]
    );
}

// For final decision
export async function finalizeReview(requestId, officerId, status, comment) {
    await pool.query(
        `UPDATE requests
         SET status = $1,
             final_reviewer_id = $2,
             final_comment = $3,
             final_reviewed_at = NOW(),
             updated_at = NOW()
         WHERE id = $4`,
        [status, officerId, comment, requestId]
    );
}
