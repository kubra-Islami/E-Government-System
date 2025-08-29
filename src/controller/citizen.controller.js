import {getAllServices,getServicesByDepartmentId} from "../dao/service.dao.js";
import {getAllDepartments} from "../dao/department.dao.js";
import {addDocumentDao, addRequestDao, getRequestsByCitizenId} from "../dao/request.dao.js";
import {getAllRequests} from "../services/requests.service.js";


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


export const submitServiceApplication = async (req, res, next) => {
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

export const submitServiceApplication1 = async (req, res, next) => {
    try {
        const { department, service } = req.body;
        const citizenId = req.user.id;

        // Insert request
        const newRequest = await addRequestDao({
            citizen_id: citizenId,
            service_id: service,
        });
        console.log(newRequest);
        console.log(citizenId);
        console.log('department');
        console.log(department);
        // Handle file uploads (if any)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await addDocumentDao({
                    request_id: newRequest.id,
                    file_path: file.filename,
                    original_name: file.originalname
                });
            }
        }
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