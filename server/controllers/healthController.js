import mongoose from "mongoose";

// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];

export const getHealth = (req, res) => {
  res.json({
    status: "ok",
    database: dbStates[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
};
