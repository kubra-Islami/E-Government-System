import { getPaymentById } from "../services/payments.service.js";

export const getPaymentSuccess = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const payment = await getPaymentById(paymentId);
        res.render("citizen/payment-success", {title:"success payment page", payment, layout: "layouts/citizen_layout", });
    } catch (err) {
        next(err);
    }
};
