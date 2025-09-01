import * as DepartmentDAO from "../dao/department.dao.js";

export async function addDepartment (name) {
    return await DepartmentDAO.addDepartmentDao(name);
}

export const getDepartment = async (id) => {
    return await DepartmentDAO.getDepartmentById(id);
};

export async function getAllDepartments () {
    return await DepartmentDAO.getAllDepartmentsDao();

}


export const editDepartment = async (id, name) => {
    return await DepartmentDAO.updateDepartment(id, name);
};

export const removeDepartment = async (id) => {
    return await DepartmentDAO.deleteDepartment(id);
};