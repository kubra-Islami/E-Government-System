import express from "express";
const router = express.Router();
import { ensureAuthenticated, ensureOfficer } from '../middlewares/auth.requireOfficer.js';
import * as OfficerController from '../controller/officer.controller.js';
import {buildBreadcrumbs} from "../middlewares/breadcrumbs.js";
import { upload } from "../middlewares/upload.middleware.js";
import {uploadAvatar} from "../controller/upload.Controller.js";

router.use(ensureAuthenticated,buildBreadcrumbs, ensureOfficer);

// Dashboard
router.get('/dashboard', OfficerController.dashboard);

// Requests
router.get("/requests", OfficerController.requestsList);
router.get("/requests/:id", OfficerController.requestDetail);
router.post("/requests/:id/review", OfficerController.postReview);

// Assign request (self-assign or assign to another officer)
router.post("/requests/:id/assign", OfficerController.assignRequest);

// Notes / Tickets (for citizen communication)
router.post("/requests/:id/notes", OfficerController.addNote);
router.get("/requests/:id/notes", OfficerController.getNotes);

// Notifications (triggered when officer leaves note or review)
router.post("/requests/:id/notify", OfficerController.sendNotification);

// Documents
router.get("/documents/:id/download", OfficerController.downloadDocument);
router.post("/documents/:id/upload", OfficerController.uploadDocument);

// Optional: request search/filter
router.get("/search", OfficerController.searchRequests);

// profile
router.get("/profile", OfficerController.profile);
// Update profile
router.post("/profile/update", OfficerController.updateOfficerProfile);

// Upload avatar
router.post("/profile/upload-avatar", upload.single("avatar"), uploadAvatar);

export default router;