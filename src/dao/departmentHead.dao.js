import db from "../config/db.js";

export async function fetchDepartmentStats(departmentId) {
    const {rows} = await db.query(`
        SELECT (SELECT COUNT(*) FROM users WHERE department_id = $1 AND role = 'officer') AS officers,
               (SELECT COUNT(*)
                FROM requests r
                         JOIN services s ON r.service_id = s.id
                WHERE s.department_id = $1)                                               AS total_requests,
               (SELECT COUNT(*)
                FROM requests r
                         JOIN services s ON r.service_id = s.id
                WHERE s.department_id = $1
                  AND r.status = 'approved')                                              AS approved,
               (SELECT COUNT(*)
                FROM requests r
                         JOIN services s ON r.service_id = s.id
                WHERE s.department_id = $1
                  AND r.status = 'rejected')                                              AS rejected
    `, [departmentId]);
    return rows[0];
}

export async function getDepartmentReports({ departmentId, officerId, status, startDate, endDate }) {
    let query = `
            SELECT r.id, r.citizen_id, r.service_id, r.officer_id, r.status, r.created_at, r.updated_at,
                   u.name AS citizen_name, s.name AS service_name, o.name AS officer_name
            FROM requests r
            JOIN users u ON r.citizen_id = u.id
            JOIN services s ON r.service_id = s.id
            LEFT JOIN users o ON r.officer_id = o.id
            WHERE s.department_id = $1
        `;

    const params = [departmentId];
    let paramIndex = 2;

    if (officerId) {
        query += ` AND r.officer_id = $${paramIndex}`;
        params.push(officerId);
        paramIndex++;
    }

    if (status) {
        query += ` AND r.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }

    if (startDate) {
        query += ` AND r.created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
    }

    if (endDate) {
        query += ` AND r.created_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
    }

    query += ` ORDER BY r.created_at DESC`;

    const { rows } = await db.query(query, params);
    return rows;
}



export async function getDepartments() {
    const {rows} = await db.query(`SELECT id, name
                                   FROM departments
                                   ORDER BY name ASC`);
    return rows;
}

// export async function findRequestsByDepartment(departmentId) {
//     const {rows} = await db.query(
//         `SELECT r.*, u.name as citizen_name
//          FROM requests r
//                   JOIN users u ON r.citizen_id = u.id
//                   JOIN services s ON r.service_id = s.id
//          WHERE s.department_id = $1`,
//         [departmentId]
//     );
//     return rows;
// }

export async function findRequestsByDepartment(departmentId) {
    const { rows } = await db.query(`
        SELECT r.id, r.citizen_id, r.service_id, r.status, r.created_at,
               u.name AS citizen_name,
               s.name AS service_name
        FROM requests r
                 JOIN users u ON r.citizen_id = u.id
                 JOIN services s ON r.service_id = s.id
        WHERE s.department_id = $1
        ORDER BY r.created_at DESC
            LIMIT 5
    `, [departmentId]);

    return rows;
}


export async function findOfficersByDepartment(departmentId) {
    const {rows} = await db.query(
        `SELECT *
         FROM users
         WHERE department_id = $1
           AND role = 'officer'`,
        [departmentId]
    );
    return rows;
}


export async function insertOfficer(departmentId, officerData) {
    const {name, email, password, job_title} = officerData;
    await db.query(
        `INSERT INTO users (name, email, password, role, department_id, job_title)
         VALUES ($1, $2, $3, 'officer', $4, $5)`,
        [name, email, password, departmentId, job_title]
    );
}

export async function deleteOfficer(officerId, departmentId) {
    await db.query(
        `DELETE
         FROM users
         WHERE id = $1
           AND department_id = $2
           AND role = 'officer'`,
        [officerId, departmentId]
    );
}

export async function findRequestById(requestId, departmentId) {
    const {rows} = await db.query(
        `SELECT r.*, s.department_id
         FROM requests r
                  JOIN services s ON r.service_id = s.id
         WHERE r.id = $1
           AND s.department_id = $2`,
        [requestId, departmentId]
    );
    return rows[0];
}

