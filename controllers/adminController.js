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
    await Admin.findByIdAndDelete(req.params.id);
    res.status(201).json({ msg: "Added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
