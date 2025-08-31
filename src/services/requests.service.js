import {addRequestDao, getAllRequestsDao} from "../dao/request.dao.js";

export async function getAllRequests(){
    return await getAllRequestsDao();
}

export async function addRequest({ citizen_id, service_id }){
    return await addRequestDao({ citizen_id, service_id });
}