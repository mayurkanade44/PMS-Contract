import moment from "moment";
import Admin from "../models/adminModel.js";
import Contract from "../models/contractModel.js";
import { capitalLetter } from "../utils/helper.js";

export const createContract = async (req, res) => {
  const { type } = req.body;
  try {
    const admin = await Admin.findById("64fef7fee25b8a61d21a381e");

    req.body.billToDetails.name = capitalLetter(req.body.billToDetails.name);
    req.body.shipToDetails.name = capitalLetter(req.body.shipToDetails.name);

    let count = admin.contractCounter + 1;
    let contractNo = `PMS-${type}/${moment().format("YY")}/${count}`;
    let contractExists = await Contract.findOne({ contractNo });
    while (contractExists) {
      count += 1;
      contractNo = `PMS-${type}/${moment().format("YY")}/${count}`;
      contractExists = await Contract.findOne({ contractNo });
    }

    admin.contractCounter = count;
    await admin.save();

    const quarterlyMonths = [];
    let quarterlyMonth = req.body.tenure.startDate;
    while (moment(quarterlyMonth).isBefore(req.body.tenure.endDate)) {
      quarterlyMonth = moment(quarterlyMonth).add(3, "months");
      quarterlyMonths.push(moment(quarterlyMonth).format("MMM YY"));
    }

    req.body.quarterlyMonths = quarterlyMonths;
    req.body.contractNo = contractNo;
    req.body.shipToDetails.pincode = req.body.shipToDetails.pincode
      .split(" ")
      .join("");

    const newContract = await Contract.create(req.body);

    return res
      .status(201)
      .json({ id: newContract._id, msg: "New contract created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getContract = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await Contract.findById(id)
      .populate({
        path: "services",
        select:
          "frequency area services serviceDates serviceStartDate serviceMonths treatmentLocation card qr instruction",
      })
      .populate({ path: "billings", select: "number gstNo" });
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    return res.json(contract);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const updateContract = async (req, res) => {
  const { type } = req.body;
  const { id } = req.params;
  try {
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    if (contract.type !== type)
      return res.status(400).json({ msg: "Contract Type change not allowed" });

    req.body.billToDetails.name = capitalLetter(req.body.billToDetails.name);
    req.body.shipToDetails.name = capitalLetter(req.body.shipToDetails.name);

    await Contract.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ msg: "Contract updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
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
        { "shipToDetails.name": { $regex: search, $options: "i" } },
        { "billToDetails.name": { $regex: search, $options: "i" } },
        {
          "billToDetails.contact": {
            $elemMatch: { number: { $regex: search, $options: "i" } },
          },
        },
        {
          "shipToDetails.contact": {
            $elemMatch: { number: { $regex: search, $options: "i" } },
          },
        },
      ],
    };
  }
  try {
    let pageNumber = Number(page) || 1;

    const count = await Contract.countDocuments({ ...query });

    const contracts = await Contract.find(query)
      .populate({
        path: "services",
        select: "services",
      })
      .sort("-createdAt")
      .skip(10 * (pageNumber - 1))
      .limit(10);

    res.json({ contracts, pages: Math.min(10, Math.ceil(count / 10)) });
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
      item.sales && sales.push(item.sales),
        item.serviceName && services.push(item.serviceName),
        item.serviceComment && comments.push(item.serviceComment);
    }

    return res.json({ services, sales, comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
