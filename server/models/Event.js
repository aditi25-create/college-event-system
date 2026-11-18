import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: ["Technical", "Cultural", "Sports", "Workshop", "Seminar", "Other"],
      default: "Technical",
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Event venue/location is required"],
      trim: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    capacity: {
      type: Number,
      required: [true, "Maximum attendee capacity is required"],
      min: [1, "Capacity must be at least 1"],
      default: 50,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    bannerImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    registrationDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for remaining spots
eventSchema.virtual("spotsRemaining").get(function () {
  return Math.max(0, this.capacity - this.registeredCount);
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

const Event = mongoose.model("Event", eventSchema);

export default Event;
