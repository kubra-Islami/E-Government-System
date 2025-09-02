import {addRequestDao, getAllRequestsDao,getRequestByIdDao , getRequestsByCitizenId as getRequestsByCitizenIdDao} from "../dao/request.dao.js";

export async function getAllRequests(){
    return await getAllRequestsDao();
}

export async function addRequest({ citizen_id, service_id }){
    return await addRequestDao({ citizen_id, service_id });
}


export async function getRequestById( request_id){
    return await getRequestByIdDao(request_id );
}

export async function getRequestsByCitizenId(citizenId) {
    return await getRequestsByCitizenIdDao(citizenId);
}

