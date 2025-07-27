import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    eventName: { type: String, required: true },
    timestamp: { type: Date, required: true },
    properties: { type: Object, default: {} },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ orgId: 1, projectId: 1, timestamp: -1 });
eventSchema.index({ projectId: 1, eventName: 1, timestamp: -1 });
eventSchema.index({ projectId: 1, userId: 1, timestamp: -1 });
eventSchema.index({ userId: 1, eventName: 1, timestamp: -1 });
eventSchema.index({ orgId: 1, projectId: 1, timestamp: 1 });

eventSchema.index(
  { userId: 1, eventName: 1, timestamp: 1, orgId: 1, projectId: 1 },
  { unique: true }
);

export const Event = mongoose.model("Event", eventSchema);
