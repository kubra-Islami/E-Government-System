import {getServicesByDepartmentId} from "../dao/service.dao.js";

import { getRequestsByCitizenId} from "../dao/request.dao.js";
import {addDocument} from "../services/documents.service.js";
import {addRequest ,getRequestById} from "../services/requests.service.js";
import {getAllServices} from "../services/service.service.js";
import {getAllDepartments} from "../services/department.service.js";
import { addPayment } from "../services/payments.service.js";

export const getCitizenDashboard = async (req, res, next) => {
    try {
        res.render("citizen/dashboard", {
            title: "Citizen Dashboard",
            user: req.user,
        });
    } catch (err) {
        next(err);
    }
};

export const getCitizenRequests = async (req, res, next) => {
    try {
        const requests = await getRequestsByCitizenId(req.user.id);
        res.render("citizen/requests", {
            title: "My Applications",
            user: req.user,
            requests
        });
    } catch (err) {
        next(err);
    }
};

export const getServicesAndDepartments = async (req, res, next) => {
    try {
        const services = await getAllServices();
        const departments = await getAllDepartments();
        res.render("citizen/applyService", {
            title: "Request Services",
            user: req.user,
            services,
            departments
        });
    } catch (err) {
        next(err);
    }
};

export const submitServiceApplication = async (req, res, next) => {
    try {
        const { department, service } = req.body;
        const citizenId = req.user.id;

        // Insert request
        const newRequest = await addRequest({
            citizen_id: citizenId,
            service_id: service,
        });
        // Handle file uploads (if any)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await addDocument({
                    request_id: newRequest.id,
                    file_path: file.filename,
                    original_name: file.originalname
                });
            }
        }
        // console.log(req.files);
        // res.redirect("/citizen/requests");
        // res.redirect(`/citizen/payments/${newRequest.id}`);
        res.redirect("/citizen/payments");
    } catch (err) {
        next(err);
    }
};

export const getServicesByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const services = await getServicesByDepartmentId(departmentId);
        res.json(services);
    } catch (err) {
        next(err);
    }
};

export const getPaymentPage = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const request = await getRequestById(requestId);

        if (!request) return res.status(404).send("Request not found");

        res.render("citizen/payments", {
            title: "Payments",
            request,
            service: request.service,
            department: request.department
        });
    } catch (err) {
        next(err);
    }
};

export const submitPayment = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { paymentMethod } = req.body;

        // Simulate payment processing
        const paymentStatus = "success";

        // Insert payment record
        await addPayment({
            request_id: requestId,
            amount: req.body.amount,
            status: paymentStatus
        });

        // Optionally, update request status
        // await updateRequestStatus(requestId, "paid");

        res.redirect("/citizen/requests");
    } catch (err) {
        next(err);
    }
};