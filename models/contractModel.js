import mongoose from "mongoose";

const ContractSchema = new mongoose.Schema(
  {
    contractNo: { type: String, required: true },
    type: { type: String, required: true },
    sales: { type: String, required: true },
    tenure: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      months: { type: Number, required: true },
    },
    cost: { type: String },
    billingFrequency: { type: String, required: true },
    business: { type: String, required: true },
    billToDetails: {
      name: String,
      address: String,
      nearBy: String,
      area: String,
      city: String,
      pincode: String,
      contact: [Object],
    },
    shipToDetails: {
      name: String,
      address: String,
      nearBy: String,
      area: String,
      city: String,
      pincode: String,
      contact: [Object],
    },
    sendMail: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    softCopy: { type: String },
    quarterlyMonths: [String],
    quarterlyReport: { type: String, default: null },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

ContractSchema.virtual("services", {
  ref: "Service",
  localField: "_id",
  foreignField: "contract",
  justOne: false,
});

ContractSchema.virtual("reports", {
  ref: "Report",
  localField: "_id",
  foreignField: "contract",
  justOne: false,
});

ContractSchema.virtual("billings", {
  ref: "Billing",
  localField: "_id",
  foreignField: "contract",
  justOne: false,
});

export default mongoose.model("Contract", ContractSchema);
