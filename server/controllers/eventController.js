import Event from "../models/Event.js";

// @desc    Get all events with optional filters (search, category)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const { category, search, status } = req.query;

    const query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .populate("organizer", "name email department")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email department"
    );

    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizers and Admins only)
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity,
      bannerImage,
      registrationDeadline,
    } = req.body;

    if (!title || !description || !date || !time || !venue || !capacity) {
      res.status(400);
      return next(new Error("Please provide all required event details"));
    }

    const event = await Event.create({
      title,
      description,
      category: category || "Technical",
      date,
      time,
      venue,
      capacity: Number(capacity),
      bannerImage: bannerImage || "",
      registrationDeadline: registrationDeadline || null,
      organizer: req.user._id,
    });

    const populated = await event.populate("organizer", "name email department");

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Event creator or Admin)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    // Verify creator or admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      return next(new Error("Not authorized to update this event"));
    }

    const allowedUpdates = [
      "title",
      "description",
      "category",
      "date",
      "time",
      "venue",
      "capacity",
      "bannerImage",
      "status",
      "registrationDeadline",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    const updatedEvent = await event.save();
    const populated = await updatedEvent.populate("organizer", "name email department");

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Event creator or Admin)
export const deleteEvent = async (req, res, next) => {
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
      return next(new Error("Not authorized to delete this event"));
    }

    await event.deleteOne();

    res.json({ message: "Event removed successfully" });
  } catch (error) {
    next(error);
  }
};
