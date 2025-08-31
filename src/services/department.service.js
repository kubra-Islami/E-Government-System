import {addDepartmentDao, getAllDepartmentsDao} from "../dao/department.dao.js";

export async function addDepartment (data) {
    const department = await addDepartmentDao({
        name: data.name,
    });

    return department;
}
export async function getAllDepartments () {
     return getAllDepartmentsDao();

}