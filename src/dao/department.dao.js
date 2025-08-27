import pool from "../config/db.js";
import Department from "../models/Department.js";


export const getAllDepartments = async () => {
    const result = await pool.query("SELECT id, name FROM departments ORDER BY id ASC");
    return result.rows;
};

export const addDepartmentDao = async (data) => {
    const {name} = data;
    const sql = `
        INSERT INTO departments (name)
        VALUES ($1)
            RETURNING *;
    `;
    const params = [name];
    const { rows } = await pool.query(sql, params);
    return new Department(rows[0]);
}