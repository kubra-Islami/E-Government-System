import pool from "../config/db.js";
import Service from "../models/Service.js";

export async function addServiceDao(data) {
    const {name,department_id,fee} = data;

    const sql = `INSERT INTO Services (name, department_id, fee) VALUES ($1,$2,$3) RETURNING *`;
    const params = [name, department_id,fee];

    const { rows } = await pool.query(sql, params);
    return new Service(rows[0]);
}

export async function getAllServices(){
    const result = await pool.query(`
            SELECT s.id, s.name, s.fee, d.name as department
            FROM services s
            JOIN departments d ON s.department_id = d.id
            ORDER BY s.id ASC
        `);
    return result.rows;
}