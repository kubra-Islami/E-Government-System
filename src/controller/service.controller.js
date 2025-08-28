import {addService} from "../services/service.service.js"
import {getAllServices} from "../dao/service.dao.js";
import {getAllDepartments} from "../dao/department.dao.js";

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
        const services = await getAllServices();
        const departments = await getAllDepartments();

        res.render("admin/services", {
            title: "Manage Services",
            services,
            departments
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};