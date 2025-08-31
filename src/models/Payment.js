class Payment {
    constructor({ id, request_id, amount, status, payment_date }) {
        this.id = id;
        this.request_id = request_id;
        this.amount = parseFloat(amount);
        this.status = status;
        this.payment_date = payment_date;
    }
}

export default Payment;
