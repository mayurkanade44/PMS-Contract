import Admin from "../models/adminModel.js";
import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import Report from "../models/reportModel.js";

export const addAdminValue = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json({ msg: "Added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const deleteAdminValue = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.body.id);
    res.status(200).json({ msg: "Deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getAllValues = async (req, res) => {
  try {
    const values = await Admin.find();

    const services = [];
    const sales = [];
    const comments = [];

    for (let item of values) {
      item.sales && sales.push({ name: item.sales.label, id: item._id }),
        item.serviceName &&
          services.push({ name: item.serviceName.label, id: item._id }),
        item.serviceComment &&
          comments.push({ name: item.serviceComment.value, id: item._id });
    }

    return res.json({ services, sales, comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
