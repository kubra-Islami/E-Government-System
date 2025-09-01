import * as DepartmentService from "../services/department.service.js";
import {editDepartment} from "../services/department.service.js";

export async function addDepartmentController(req, res) {
    try {
        const {name} = req.body;
        if (!name){
            return res.status(400).send({error: 'name is required'});
        }
        await DepartmentService.addDepartment(req.body);
        res.redirect("/admin/departments");
    }catch (err){
        res.status(500).send("Error adding department : " + err.message);
    }
}


// Show list of departments
export const showDepartments = async (req, res) => {
    const departments = await DepartmentService.getAllDepartments();
    res.render("admin/departments", { title: "Departments", departments });
};

// Show edit form
export const showDepartmentController = async (req, res) => {
    const { id } = req.params;
    const department = await DepartmentService.getDepartment(id);
    res.render("admin/edit_department", { title: "Edit Department", department });
};

// Handle update
export const updateDepartmentController = async (req, res) => {
    const { id, name } = req.body;
    try {
        await editDepartment(id, name);
        res.redirect("/admin/departments");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating department");
    }
};

// Handle delete
export const deleteDepartmentController = async (req, res) => {
    const { id } = req.params;
    await DepartmentService.removeDepartment(id);
    res.redirect("/admin/departments");
};
