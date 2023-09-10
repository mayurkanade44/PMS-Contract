import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    frequency: { type: String, required: true },
    serviceStartDate: { type: Object },
    area: { type: String, required: true },
    treatmentLocation: { type: String, required: true },
    instruction: { type: String, required: true },
    services: [Object],
    serviceMonths: [String],
    serviceDates: [String],
    qr: { type: String },
    card: { type: String },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Contract",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Service", ServiceSchema);
