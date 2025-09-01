import pool from "../config/db.js";
import Department from "../models/Department.js";

export async function getAllDepartmentsDao() {
    const result = await pool.query("SELECT id, name FROM departments ORDER BY id ASC");
    return result.rows;
}

export async function addDepartmentDao(data) {
    const {name} = data;
    const sql = `
        INSERT INTO departments (name)
        VALUES ($1) RETURNING *;
    `;
    const params = [name];
    const {rows} = await pool.query(sql, params);
    return new Department(rows[0]);
}

// Get one department by ID
export const getDepartmentById = async (id) => {
    const result = await pool.query("SELECT * FROM departments WHERE id = $1", [id]);
    return result.rows[0];
};

// Update department
export const updateDepartment = async (id, name) => {
    const result = await pool.query(
        `UPDATE departments 
         SET name = $1, updated_at = NOW() 
         WHERE id = $2 RETURNING *`,
        [name, id]
    );
    return result.rows[0];
};

// Delete department
export const deleteDepartment = async (id) => {
    const result = await pool.query(
        "DELETE FROM departments WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0];
};