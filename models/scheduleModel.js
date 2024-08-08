import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    contractNo: { type: String, required: true },
    clientName: { type: String, required: true },
    clientAddress: { type: String, required: true },
    clientContact: { type: String, required: true },
    clientEmail: [Object],
    pincode: { type: String, required: true },
    serviceName: [String],
    emailSent: { type: Boolean, default: false },
    serviceType: {
      type: String,
      required: true,
      enum: ["regular", "complaint"],
    },
    scheduleType: {
      type: String,
      required: true,
      enum: ["byClient", "confirmed", "cancelled"],
    },
    jobStatus: {
      type: String,
      required: true,
      enum: ["open", "done"],
      default: "open",
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    jobDuration: { type: String },
    raiseBy: { type: String },
    instruction: { type: String },
    image: [String],
    assistantTechnician: { type: String },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Service",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Schedule", ScheduleSchema);
