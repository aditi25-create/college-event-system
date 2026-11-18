import { Router } from "express";
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  checkRegistrationStatus,
  getEventAttendees,
  getRegistrationQR,
  checkInAttendee,
} from "../controllers/registrationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/events/:id", protect, registerForEvent);
router.get("/events/:id/status", protect, checkRegistrationStatus);
router.delete("/:id", protect, cancelRegistration);
router.get("/my-events", protect, getMyRegistrations);
router.get("/event/:id/attendees", protect, getEventAttendees);
router.get("/:id/qr", protect, getRegistrationQR);
router.post("/check-in", protect, authorize("organizer", "admin"), checkInAttendee);

export default router;
