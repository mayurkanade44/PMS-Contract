import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    type: { type: String, required: true },
    billNo: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    paymentMode: { type: String },
    paymentDate: { type: Date },
    paymentRefernce: { type: String },
    remark: { type: String },
    url: { type: String },
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
