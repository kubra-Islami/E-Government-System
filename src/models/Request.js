export default class Request {
    constructor({
                    id,
                    citizen_id,
                    service_id,
                    reviewed_by,
                    status,
                    created_at,
                    updated_at,
                    service_name,
                    service_fee,
                    department_name,
                    reviewer_name
                }) {
        this.id = id;
        this.citizen_id = citizen_id;
        this.service_id = service_id;
        this.reviewed_by = reviewed_by;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;

        // Enriched fields from JOINs
        this.service_name = service_name;
        this.service_fee = service_fee;
        this.department_name = department_name;
        this.reviewer_name = reviewer_name;
    }
}
