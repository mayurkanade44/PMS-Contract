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
    billingFrequency: { type: String, required: true },
    preferred: {
      day: String,
      time: String,
    },
    billToAddress: {
      name: String,
      address: String,
      nearBy: String,
      city: String,
      pincode: String,
    },
    billToContact: [
      {
        name: String,
        number: String,
        email: String,
      },
    ],
    shipToAddress: {
      name: String,
      address: String,
      nearBy: String,
      city: String,
      pincode: String,
    },
    shipToContact: [
      {
        name: String,
        number: String,
        email: String,
      },
    ],
    sendMail: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    softCopy: { type: String },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

ContractSchema.virtual("services", {
  ref: "Service",
  localField: "_id",
  foreignField: "contract",
  justOne: false,
});

export default mongoose.model("Contract", ContractSchema);
