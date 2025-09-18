export default class User {
    constructor({
                    id,
                    name,
                    email,
                    password,
                    national_id,
                    date_of_birth,
                    contact_info,
                    role,
                    department_id,
                    job_title,
                    created_at,
                    updated_at,
                }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.national_id = national_id;
        this.date_of_birth = date_of_birth;
        this.contact_info = contact_info;
        this.role = role;
        this.department_id = department_id;
        this.job_title = job_title;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
