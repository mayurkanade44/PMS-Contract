import Admin from "../models/adminModel.js";
import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import Report from "../models/reportModel.js";
import User from "../models/userModel.js";
import { capitalLetter } from "../utils/helper.js";

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

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await user.deleteOne();
    return res.json({ msg: "User Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const addUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password || !role)
      return res.status(400).json({ msg: "Please provide required values" });

    req.body.name = capitalLetter(name);

    const user = await User.create(req.body);
    return res.status(201).json({ msg: `${user.name} is added` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
