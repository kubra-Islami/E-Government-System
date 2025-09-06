import pool from "../config/db.js";
import Document from "../models/Document.js";

export const addDocumentDao = async ({ request_id, file_path, original_name }) => {
    const sql = `INSERT INTO documents (request_id, file_path, original_name)
                 VALUES ($1, $2, $3) RETURNING *`;
    const params = [request_id, file_path, original_name];
    const { rows } = await pool.query(sql, params);
    return rows[0];
};

export async function getById(id) {
    const result = await pool.query(
        "SELECT id, request_id, file_path, original_name, uploaded_at FROM documents WHERE id = $1",
        [id]
    );
    return result.rows[0];
}
