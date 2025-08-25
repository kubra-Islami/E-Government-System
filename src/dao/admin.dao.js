import pool from "../config/db.js";

export async function getUserList() {
    const { rows } = await pool.query("SELECT id, name, email, role FROM users ORDER BY id ASC");
    return rows;
}

export async function deleteUser(id) {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
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
    return rows.map(r => new Report(r));
}
