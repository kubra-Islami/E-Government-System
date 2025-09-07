import express from "express";
const router = express.Router();
import { ensureAuthenticated, ensureOfficer } from '../middlewares/auth.requireOfficer.js';
import * as OfficerController from '../controller/officer.controller.js';
import {profile} from "../controller/officer.controller.js";

router.use(ensureAuthenticated, ensureOfficer);

// Dashboard
router.get('/dashboard', OfficerController.dashboard);

// Requests
router.get("/requests", OfficerController.requestsList);          // List all assigned requests
router.get("/requests/:id", OfficerController.requestDetail);     // View request details
router.post("/requests/:id/review", OfficerController.postReview); // Approve/Reject request

// Assign request (self-assign or assign to another officer)
router.post("/requests/:id/assign", OfficerController.assignRequest);

// Notes / Tickets (for citizen communication)
router.post("/requests/:id/notes", OfficerController.addNote);     // Officer leaves note/comment
router.get("/requests/:id/notes", OfficerController.getNotes);     // View notes on a request

// Notifications (triggered when officer leaves note or review)
router.post("/requests/:id/notify", OfficerController.sendNotification);

// Documents
router.get("/documents/:id/download", OfficerController.downloadDocument);
router.post("/documents/:id/upload", OfficerController.uploadDocument);

// Optional: request search/filter
router.get("/search", OfficerController.searchRequests);

// profile
router.get("/profile", OfficerController.profile);

export default router;