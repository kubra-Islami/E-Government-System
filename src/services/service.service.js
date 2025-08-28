import {addServiceDao} from "../dao/service.dao.js";


export async function addService(data) {
    const service = await addServiceDao({
        name: data.name,
        fee: data.fee,
        department_id : data.department
    });
    return service;
}