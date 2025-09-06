import pool from "../config/db.js";
import Service from "../models/Service.js";

export async function addServiceDao(data) {
    const {name, department_id, fee} = data;

    const sql = `INSERT INTO Services (name, department_id, fee)
                 VALUES ($1, $2, $3) RETURNING *`;
    const params = [name, department_id, fee];

    const {rows} = await pool.query(sql, params);
    return new Service(rows[0]);
}

export async function getAllServicesDao() {
    const result = await pool.query(`
        SELECT s.id, s.name, s.fee, s.department_id, d.name as department
        FROM services s
                 JOIN departments d ON s.department_id = d.id
        ORDER BY s.id ASC
    `);
    return result.rows;
}

// Get one Service by ID
export const getServiceById = async (id) => {
    const result = await pool.query(
        `SELECT s.id, s.name, s.fee, s.department_id, d.name AS department_name
         FROM services s
         JOIN departments d ON s.department_id = d.id
         WHERE s.id = $1`,
        [id]
    );
    return result.rows[0];
};


export const getServicesByDepartmentId = async (departmentId) => {
    const query = "SELECT * FROM services WHERE department_id = $1";
    const {rows} = await pool.query(query, [departmentId]);
    return rows;
};

export async function getServicesByDepartment(departmentId) {
    const { rows } = await pool.query(`
        SELECT id, name, fee 
        FROM services 
        WHERE department_id = $1
        ORDER BY name
    `, [departmentId]);
    return rows;
}
// Update Service
export const updateService = async (name, fee, department_id, id) => {
    const result = await pool.query(
        `UPDATE services
         SET name = $1,
             fee = $2,
             department_id = $3,
             updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [name, fee, department_id, id]
    );
    return result.rows[0];
};


// Delete Service
export const deleteService = async (id) => {
    const result = await pool.query(
        "DELETE FROM services WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0];
};