export default class Document {
    constructor({ id, request_id, file_path, uploaded_at }) {
        this.id = id;
        this.request_id = request_id;
        this.file_path = file_path;
        this.uploaded_at = uploaded_at;
    }
}
