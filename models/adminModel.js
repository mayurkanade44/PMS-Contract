import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  serviceComment: { type: Object },
  sales: { type: String },
  serviceName: { type: Object },
});

export default mongoose.model("Admin", AdminSchema);
