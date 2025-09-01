import * as ServiceDAO from "../dao/service.dao.js";

export async function addService(data) {
    return await ServiceDAO.addServiceDao({
        name: data.name,
        fee: data.fee,
        department_id : data.department
    });
}

export const getService = async (id) => {
    return await ServiceDAO.getServiceById(id);
};

export async function getAllServices(){
    return await ServiceDAO.getAllServicesDao();
}

export const editService = async (name, fee, department_id, id) => {
    return await ServiceDAO.updateService(name, fee, department_id, id);
};

export const removeService = async (id) => {
    return await ServiceDAO.deleteService(id);
};