import pool from "../config/db.js";
import Document from "../models/Document.js";

export const addDocumentDao = async ({ request_id, file_path }) => {
    const sql = `INSERT INTO documents (request_id, file_path) 
                 VALUES ($1, $2) RETURNING *`;
    const params = [request_id, file_path];
    const { rows } = await pool.query(sql, params);
    return new Document(rows[0]);
};
