import pool from "../config/db.js";

export const getAllDepartments = async () => {
    const result = await pool.query("SELECT id, name FROM departments ORDER BY id ASC");
    return result.rows;
};
