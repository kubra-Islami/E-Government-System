import {addPaymentDao, getPaymentByIdDB} from "../dao/payments.dao.js";
import Payment from "../models/Payment.js";

export async function addPayment({ request_id, amount, status }) {
    // return await addPaymentDao({ request_id, amount, status });
    const row = await addPaymentDao({ request_id, amount, status });
    return new Payment(row);
}

export const getPaymentById = async (paymentId) => {
    const payment = await getPaymentByIdDB(paymentId);

    if (!payment) {
        const error = new Error("Payment not found");
        error.status = 404;
        throw error;
    }

    return payment;
};