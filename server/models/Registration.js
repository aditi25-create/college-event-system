import mongoose from "mongoose";
import crypto from "crypto";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "attended", "cancelled"],
      default: "registered",
    },
    ticketId: {
      type: String,
      unique: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active registrations for the same user and event
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Auto-generate a unique human-friendly Ticket ID before save
registrationSchema.pre("save", function (next) {
  if (!this.ticketId) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.ticketId = `TKT-${Date.now().toString().slice(-6)}-${randomHex}`;
  }
  next();
});

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
