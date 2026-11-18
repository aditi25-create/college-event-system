import { Router } from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router
  .route("/")
  .get(getEvents)
  .post(protect, authorize("organizer", "admin"), createEvent);

router
  .route("/:id")
  .get(getEventById)
  .put(protect, authorize("organizer", "admin"), updateEvent)
  .delete(protect, authorize("organizer", "admin"), deleteEvent);

export default router;
