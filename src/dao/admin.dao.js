import pool from "../config/db.js";
import Report from "../models/Report.js";

export async function getUserList() {
    const { rows } = await pool.query("SELECT * FROM users ORDER BY id ASC");
    return rows;
}

export async function deleteUser(id) {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
}

export async function getUserByIdDao(id) {
    const { rows } = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id=$1",
        [id]
    );
    return rows[0];
}

// Update user
export async function updateUserDao(id, { name, email, role }) {
    const sql = "UPDATE users SET name=$1, email=$2, role=$3, updated_at=NOW() WHERE id=$4";
    await pool.query(sql, [name, email, role, id]);
}

// Dashboard Stats
export async function getDashboardStatsDao() {
    const sql = `
        SELECT
            COUNT(*) as total_requests,
            COUNT(CASE WHEN status='approved' THEN 1 END) as approved,
            COUNT(CASE WHEN status='rejected' THEN 1 END) as rejected
        FROM requests;
    `;
    const { rows } = await pool.query(sql);
    return rows[0];
}

// Reports
export async function getReports() {
    const sql = `
        SELECT d.name as department,
               COUNT(r.id) as total,
               COUNT(CASE WHEN r.status='approved' THEN 1 END) as approved,
               COUNT(CASE WHEN r.status='rejected' THEN 1 END) as rejected,
               COALESCE(SUM(p.amount),0) as fees
        FROM departments d
                 LEFT JOIN services s ON s.department_id = d.id
                 LEFT JOIN requests r ON r.service_id = s.id
                 LEFT JOIN payments p ON p.request_id = r.id AND p.status='success'
        GROUP BY d.name
        ORDER BY d.name;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(r => new Report(rows));
}


// Search Users
export async function searchUsers(query) {
    const { rows } = await pool.query(
        `SELECT id, name, email, role 
         FROM users 
         WHERE name ILIKE $1 OR email ILIKE $1
         ORDER BY name ASC`,
        [`%${query}%`]
    );
    return rows;
}

// Search Services
export async function searchServices(query) {
    const { rows } = await pool.query(
        `SELECT s.id, s.name, s.fee, d.name AS department
         FROM services s
                  JOIN departments d ON s.department_id = d.id
         WHERE s.name ILIKE $1
         ORDER BY s.name ASC`,
        [`%${query}%`]
    );
    return rows;
}

// Search Requests
export async function searchRequests(query) {
    const { rows } = await pool.query(
        `SELECT r.id, r.status, u.name AS citizen_name, s.name AS service_name
         FROM requests r
         JOIN users u ON r.citizen_id = u.id
         JOIN services s ON r.service_id = s.id
         WHERE CAST(r.id AS TEXT) ILIKE $1 OR r.status ILIKE $1
         ORDER BY r.id DESC`,
        [`%${query}%`]
    );
    return rows;
}

// dao/admin.dao.js (replace getAdminReports)
export async function getAdminReports() {
    const query = `
        SELECT d.id AS department_id, d.name AS department,
               COUNT(r.id) AS total,
               SUM(CASE WHEN r.status = 'submitted' THEN 1 ELSE 0 END) AS submitted,
               SUM(CASE WHEN r.status = 'under_review' THEN 1 ELSE 0 END) AS under_review,
               SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END) AS approved,
               SUM(CASE WHEN r.status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
               COALESCE(SUM(p.amount), 0) AS fees
        FROM departments d
                 LEFT JOIN services s ON s.department_id = d.id
                 LEFT JOIN requests r ON r.service_id = s.id
                 LEFT JOIN payments p ON p.request_id = r.id AND p.status = 'success'
        GROUP BY d.id, d.name
        ORDER BY d.name;
    `;

    const { rows } = await pool.query(query);

    // Ensure numeric types for JS
    for (let row of rows) {
        row.total = parseInt(row.total, 10) || 0;
        row.submitted = parseInt(row.submitted, 10) || 0;
        row.under_review = parseInt(row.under_review, 10) || 0;
        row.approved = parseInt(row.approved, 10) || 0;
        row.rejected = parseInt(row.rejected, 10) || 0;
        row.fees = parseFloat(row.fees) || 0;

        const serviceQuery = `
            SELECT s.id, s.name, COUNT(r.id) AS total
            FROM services s
                     LEFT JOIN requests r ON r.service_id = s.id
            WHERE s.department_id = $1
            GROUP BY s.id, s.name
            ORDER BY s.name;
        `;
        const { rows: serviceRows } = await pool.query(serviceQuery, [row.department_id]);

        // convert service totals to numbers
        row.services = serviceRows.map(s => ({
            id: s.id,
            name: s.name,
            total: parseInt(s.total, 10) || 0
        }));
    }

    return rows;
}
