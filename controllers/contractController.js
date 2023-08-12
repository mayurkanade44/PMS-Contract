import Contract from "../models/contractModel.js";
import { capitalLetter } from "../utils/helper.js";

export const createContract = async (req, res) => {
  const { contractNo, type } = req.body;
  try {
    const contractExists = await Contract.findOne({ contractNo });
    if (contractExists && type === "NC")
      return res.status(400).json({ msg: "Contract number already exists" });

    req.body.billToAddress.name = capitalLetter(req.body.billToAddress.name);
    req.body.shipToAddress.name = capitalLetter(req.body.shipToAddress.name);
    req.body.preferred.day = capitalLetter(req.body.preferred.day);

    const newContract = await Contract.create(req.body);

    return res
      .status(201)
      .json({ id: newContract._id, msg: "New contract created" });
  } catch (error) {
    console.log(error);
    res.send(500).json({ msg: "Server error, try again later" });
  }
};

export const getContract = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await Contract.findById(id).populate({
      path: "services",
      select:
        "frequency area services serviceDates serviceMonths treatmentLocation card qr",
    });
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    return res.json(contract);
  } catch (error) {}
};

export const updateContract = async (req, res) => {
  const { contractNo, type } = req.body;
  const { id } = req.params;
  try {
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    if (contract.type !== type || contract.contractNo !== contractNo)
      return res
        .status(400)
        .json({ msg: "Contract Number/Type change not allowed" });

    req.body.billToAddress.name = capitalLetter(req.body.billToAddress.name);
    req.body.shipToAddress.name = capitalLetter(req.body.shipToAddress.name);
    req.body.preferred.day = capitalLetter(req.body.preferred.day);

    await Contract.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ msg: "Contract updated" });
  } catch (error) {
    console.log(error);
    res.send(500).json({ msg: "Server error, try again later" });
  }
};

export const deleteContract = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    await Contract.deleteOne({ _id: id });

    return res.json({ msg: "Contract has been deleted" });
  } catch (error) {
    console.log(error);
    res.send(500).json({ msg: "Server error, try again later" });
  }
};

export const deactiveContract = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    contract.active = !contract.active;
    await contract.save();

    let msg;
    if (contract.active) msg = "Contract has been activated";
    else msg = "Contract has been deactivated";

    return res.json({ msg });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getAllContracts = async (req, res) => {
  const { search, page } = req.query;
  let query = {};
  if (search) {
    query = {
      $or: [
        { contractNo: { $regex: search, $options: "i" } },
        { "shipToAddress.name": { $regex: search, $options: "i" } },
        { "billToAddress.name": { $regex: search, $options: "i" } },
      ],
    };
  }
  try {
    let pageNumber = Number(page) || 1;

    const count = await Contract.countDocuments({ ...query });

    const contracts = await Contract.find(query)
      .sort("-createdAt")
      .skip(10 * (pageNumber - 1))
      .limit(10);

    res.json({ contracts, pages: Math.ceil(count / 10) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
