import { getPaymentById } from "../services/payments.service.js";

export const getPaymentSuccess = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const payment = await getPaymentById(paymentId);

        res.render("citizen/payment-success", { payment });
    } catch (err) {
        next(err);
    }
};
