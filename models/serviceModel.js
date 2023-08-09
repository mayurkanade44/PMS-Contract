import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    frequency: {
      name: { type: String },
      days: { type: Number },
    },
    services: [Object],
    serviceMonths: [String],
    serviceDates: [String],
    qr: { type: String },
    card: { type: String },
    area: { type: String, required: true },
    treatmentLocation: { type: String, required: true },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Contract",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Service", ServiceSchema);
