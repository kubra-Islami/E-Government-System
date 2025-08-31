import {getServicesByDepartmentId} from "../dao/service.dao.js";

import { getRequestsByCitizenId} from "../dao/request.dao.js";
import {addDocument} from "../services/documents.service.js";
import {addRequest} from "../services/requests.service.js";
import {getAllServices} from "../services/service.service.js";
import {getAllDepartments} from "../services/department.service.js";


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
        console.log(req.files);
        res.redirect("/citizen/requests");

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