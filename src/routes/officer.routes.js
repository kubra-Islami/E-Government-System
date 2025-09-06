import express from "express";
const router = express.Router();
import { ensureAuthenticated, ensureOfficer } from '../middlewares/auth.requireOfficer.js';
import * as OfficerController from '../controller/officer.controller.js';

router.use(ensureAuthenticated, ensureOfficer);
router.get('/dashboard', OfficerController.dashboard);
router.get('/requests', OfficerController.requestsList);
router.get('/requests/:id', OfficerController.requestDetail);
router.post('/requests/:id/review', OfficerController.postReview);
// add more routes: assign, download doc, add note, etc.

export default router;