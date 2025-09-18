import express from "express";
import * as DepartmentHeadController from "../controller/departmentHead.controller.js";

const router = express.Router();

router.get('/dashboard', DepartmentHeadController.getDashboard);


// Officers management
router.get("/officers", DepartmentHeadController.listOfficers);
router.post("/officers/add", DepartmentHeadController.addOfficer);
router.post("/officers/:id/delete", DepartmentHeadController.deleteOfficer);

// Requests in their department
router.get("/requests", DepartmentHeadController.listRequests);
router.get("/requests/:id", DepartmentHeadController.requestDetails);


router.get("/reports",DepartmentHeadController.getReports);


export default router;