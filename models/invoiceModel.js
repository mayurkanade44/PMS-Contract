import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    type: { type: String, required: true },
    tax: { type: Boolean, default: false },
    billNo: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    paymentMode: { type: String },
    paymentDate: { type: Date },
    paymentRefernce: { type: String },
    remark: { type: String },
    chequeBank: { type: String },
    chequeDrawer: { type: String },
    month: { type: String },
    url: { type: String },
    cancelled: {
      status: { type: Boolean, default: false },
      reason: { type: String },
      by: { type: String },
      at: { type: Date },
    },
    createdBy: { type: String, required: true },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Billing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
