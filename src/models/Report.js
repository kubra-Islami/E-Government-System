export default class Report {
    constructor({ department, total, approved, rejected, fees }) {
        this.department = department;
        this.total = total;
        this.approved = approved;
        this.rejected = rejected;
        this.fees = fees;
    }
}
