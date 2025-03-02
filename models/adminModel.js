import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  serviceComment: { type: Object },
  sales: { type: Object },
  serviceName: { type: Object },
  contractCounter: { type: Number },
  proformaCounter: { type: Number },
  taxCounter: { type: Number },
  mkCounter: { type: Number },
});

export default mongoose.model("Admin", AdminSchema);
