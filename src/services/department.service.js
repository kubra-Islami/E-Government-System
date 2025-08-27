import {addDepartmentDao} from "../dao/department.dao.js";


export async function addDepartment(data) {
    const department = await addDepartmentDao({
        name: data.name,
    });

    return department;
}