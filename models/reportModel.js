import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    contractNo: { type: String, required: true },
    serviceName: { type: String, required: true },
    serviceType: { type: String, required: true },
    serviceComment: { type: String, required: true },
    serviceStatus: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    image: [String],
    service: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Service",
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Contract",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", ReportSchema);
