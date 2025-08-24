import pool from "../config/db.js";
import Service from "../models/Service.js";

export async function createService(data) {
    const {name,department_id,fee} = data;

    const sql = `INSERT INTO Service (name, department_id, fee) VALUES ($1,$2,$3) RETURNING *`;
    const params = [name, department_id,fee];

    const { rows } = await pool.query(sql, params);
    return new Service(rows[0]);
}
