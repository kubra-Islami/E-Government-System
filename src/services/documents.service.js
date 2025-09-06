import {addDocumentDao} from "../dao/document.dao.js";

export async function addDocument({ request_id, file_path, original_name }) {
    return await addDocumentDao({ request_id, file_path, original_name });
}
