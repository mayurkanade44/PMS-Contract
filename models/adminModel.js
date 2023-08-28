import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  serviceComment: { type: Object },
  sales: { type: Object },
  serviceName: { type: Object },
  notificationFile: { type: String },
  contractCounter: { type: Number },
});

export default mongoose.model("Admin", AdminSchema);
