import {addDepartment} from "../services/department.service.js"

export async function addDepartmentController(req, res) {
    try {
        const {name} = req.body;
        if (!name){
            return res.status(400).send({error: 'name is required'});
        }
        await addDepartment(req.body);
        res.redirect("/admin/department");
    }catch (err){
        res.status(500).send("Error adding department user: " + err.message);
    }
}