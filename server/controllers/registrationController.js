import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import {
  generateQRToken,
  verifyQRToken,
  generateQRCodeImage,
} from "../utils/qrToken.js";

// @desc    Register current user for an event
// @route   POST /api/registrations/events/:id
// @access  Private (Students & Users)
export const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    if (event.status !== "upcoming") {
      res.status(400);
      return next(new Error("Registration is closed for this event"));
    }

    if (event.registeredCount >= event.capacity) {
      res.status(400);
      return next(new Error("This event has reached maximum capacity"));
    }

    // Check if user has an existing registration record
    let registration = await Registration.findOne({ event: eventId, user: userId });

    if (registration) {
      if (registration.status === "registered" || registration.status === "attended") {
        res.status(400);
        return next(new Error("You are already registered for this event"));
      }

      // Re-activate a previously cancelled ticket
      registration.status = "registered";
      registration.registeredAt = new Date();
      await registration.save();
    } else {
      registration = await Registration.create({
        event: eventId,
        user: userId,
        status: "registered",
      });
    }

    // Safely increment event attendees count
    event.registeredCount = (event.registeredCount || 0) + 1;
    await event.save();

    const populated = await registration.populate([
      { path: "event", select: "title date time venue category" },
      { path: "user", select: "name email collegeId department" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a user's registration
// @route   DELETE /api/registrations/:id
// @access  Private
export const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      res.status(404);
      return next(new Error("Registration not found"));
    }

    // Check authorization: must be the registrant or an admin
    if (
      registration.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      return next(new Error("Not authorized to cancel this registration"));
    }

    if (registration.status === "cancelled") {
      res.status(400);
      return next(new Error("Registration is already cancelled"));
    }

    registration.status = "cancelled";
    await registration.save();

    // Decrement attendee count
    const event = await Event.findById(registration.event);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
    }

    res.json({ message: "Registration cancelled successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations for current logged-in user
// @route   GET /api/registrations/my-events
// @access  Private
export const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
      status: { $in: ["registered", "attended"] },
    })
      .populate({
        path: "event",
        populate: { path: "organizer", select: "name email department" },
      })
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// @desc    Check registration status for a specific event
// @route   GET /api/registrations/events/:id/status
// @access  Private
export const checkRegistrationStatus = async (req, res, next) => {
  try {
    const registration = await Registration.findOne({
      event: req.params.id,
      user: req.user._id,
      status: { $in: ["registered", "attended"] },
    });

    res.json({
      isRegistered: Boolean(registration),
      registration: registration || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of attendees for an event
// @route   GET /api/registrations/event/:id/attendees
// @access  Private (Event creator or Admin)
export const getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      return next(new Error("Not authorized to view attendee details"));
    }

    const attendees = await Registration.find({
      event: req.params.id,
      status: { $in: ["registered", "attended"] },
    })
      .populate("user", "name email collegeId department")
      .sort({ createdAt: 1 });

    res.json(attendees);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate signed QR code ticket pass
// @route   GET /api/registrations/:id/qr
// @access  Private (Ticket owner or Event organizer)
export const getRegistrationQR = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("event", "title date time venue status organizer")
      .populate("user", "name email collegeId department");

    if (!registration) {
      res.status(404);
      return next(new Error("Ticket registration not found"));
    }

    // Must be ticket owner or organizer/admin
    const isOwner = registration.user._id.toString() === req.user._id.toString();
    const isOrganizer =
      registration.event.organizer.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!isOwner && !isOrganizer) {
      res.status(403);
      return next(new Error("Not authorized to view this ticket QR"));
    }

    // Generate signed QR token payload
    const qrToken = generateQRToken(
      registration._id,
      registration.ticketId,
      registration.event._id
    );

    // Generate base64 Data URL
    const qrCodeImage = await generateQRCodeImage(qrToken);

    res.json({
      ticketId: registration.ticketId,
      status: registration.status,
      qrToken,
      qrCodeImage,
      event: registration.event,
      user: registration.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in attendee by QR token or Ticket ID
// @route   POST /api/registrations/check-in
// @access  Private (Organizers and Admins only)
export const checkInAttendee = async (req, res, next) => {
  try {
    const { qrToken, ticketId, eventId } = req.body;

    if (!qrToken && !ticketId) {
      res.status(400);
      return next(new Error("Please scan a QR code or enter a valid Ticket ID"));
    }

    let regId = null;
    let targetTicketId = ticketId;

    if (qrToken) {
      try {
        const decoded = verifyQRToken(qrToken);
        regId = decoded.regId;
        targetTicketId = decoded.ticketId;
      } catch (err) {
        res.status(400);
        return next(new Error("Invalid, tampered, or expired QR code"));
      }
    }

    // Find registration record
    const query = regId ? { _id: regId } : { ticketId: targetTicketId };
    const registration = await Registration.findOne(query)
      .populate("event")
      .populate("user", "name email collegeId department");

    if (!registration) {
      res.status(404);
      return next(new Error("Ticket not found in the system"));
    }

    const event = registration.event;

    // Verify organizer permission
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      return next(new Error("You are not authorized to check in tickets for this event"));
    }

    // If an eventId was specified by the scanner, ensure ticket matches this specific event
    if (eventId && event._id.toString() !== eventId.toString()) {
      res.status(400);
      return next(
        new Error(`This ticket is for a different event: "${event.title}"`)
      );
    }

    if (registration.status === "cancelled") {
      res.status(400);
      return next(new Error("This ticket was cancelled and is no longer valid"));
    }

    // Already checked in
    if (registration.status === "attended") {
      return res.json({
        alreadyAttended: true,
        message: "Attendee already checked in",
        attendee: registration.user,
        ticketId: registration.ticketId,
        eventTitle: event.title,
        checkInTime: registration.updatedAt,
      });
    }

    // Mark as attended
    registration.status = "attended";
    await registration.save();

    res.json({
      success: true,
      message: "Check-in successful! Attendance confirmed.",
      attendee: registration.user,
      ticketId: registration.ticketId,
      eventTitle: event.title,
      checkedInAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};
