import {addRequestDao, addDocumentDao , getAllRequestsDao,getRequestByIdDao , getRequestsByCitizenId as getRequestsByCitizenIdDao} from "../dao/request.dao.js";

export async function getAllRequests(){
    return await getAllRequestsDao();
}

export async function getRequestById( request_id){
    return await getRequestByIdDao(request_id );
}

export async function getRequestsByCitizenId(citizenId) {
    return await getRequestsByCitizenIdDao(citizenId);
}


export async function createRequest({ citizen_id, service_id, status, form_data }) {
    return await addRequestDao({ citizen_id, service_id, status, form_data });
}

export async function saveDocument({ request_id, file_path, original_name }) {
    return await addDocumentDao({ request_id, file_path, original_name });
}