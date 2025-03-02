import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    type: { type: String, required: true },
    contractDetails: {
      number: { type: String, required: true },
      type: { type: String, required: true },
      business: { type: String, required: true },
      sales: { type: String, required: true },
    },
    contractAmount: {
      basic: { type: Number, required: true },
      cgst: { type: Number, required: true },
      sgst: { type: Number, required: true },
      gst: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    invoiceAmount: {
      basic: { type: Number, required: true },
      cgst: { type: Number, required: true },
      sgst: { type: Number, required: true },
      gst: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    tenure: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      months: { type: Number, required: true },
    },
    paymentTerms: { type: String },
    gstNo: { type: String },
    tds: { type: String },
    billToDetails: {
      name: String,
      address: String,
      nearBy: String,
      area: String,
      city: String,
      pincode: String,
      contact: Object,
    },
    shipToDetails: {
      name: String,
      address: String,
      nearBy: String,
      area: String,
      city: String,
      pincode: String,
      contact: Object,
    },
    serviceDetails: [Object],
    billingMonths: [String],
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Contract",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Billing", BillingSchema);
