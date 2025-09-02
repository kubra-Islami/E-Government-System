import * as ServiceOfService from "../services/service.service.js"
import {addService, editService} from "../services/service.service.js";
import * as DepartmentService from "../services/department.service.js";

export async function addServiceController(req, res) {
    try {
        const {name,fee,department} = req.body;
        if (!name || !fee || !department){
            return res.status(400).send({error: 'All fields are required'});
        }
        await addService(req.body);
        res.redirect("/admin/services");
    }catch (err){
        res.status(500).send("Error adding service : " + err.message);
    }
}

export const showServices = async (req, res) => {
    try {
        const services = await ServiceOfService.getAllServices();
        const departments = await DepartmentService.getAllDepartments();

        res.render("admin/services", {
            title: "Manage Services",
            services,
            departments
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// Show edit form
export const showServiceController = async (req, res) => {
    const { id } = req.params;
    const service = await ServiceOfService.getService(id);
    const departments = await getAllDepartments();

    res.render("admin/edit_service", { title: "Edit Service", service,departments });
};

// Handle update
export const updateServiceController = async (req, res) => {
    const { id, name, fee, department } = req.body;
    try {
        await editService(name, fee, department, id);
        res.redirect("/admin/services");
    } catch (err) {
        res.status(500).send("Error updating service: " + err.message);
    }
};


// Handle delete
export const deleteServiceController = async (req, res) => {
    const { id } = req.params;
    await ServiceOfService.removeService(id);
    res.redirect("/admin/services");
};


