export default class Request {

    constructor({id,citizen_id,service_id,reviewed_by,status}) {
        this.id = id;
        this.citizen_id = citizen_id;
        this.service_id = service_id;
        this.reviewed_by=reviewed_by;
        this.status = status;
    }

}