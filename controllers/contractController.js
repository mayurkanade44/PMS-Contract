import Contract from "../models/contractModel.js";
import { capitalLetter } from "../utils/helper.js";

export const createContract = async (req, res) => {
  const { contractNo, startDate, endDate, type } = req.body;
  try {
    let contract = contractNo.trim()[0].toUpperCase() + contractNo.slice(1);

    const contractExists = await Contract.findOne({ contractNo: contract });
    if (contractExists && type === "NC")
      return res.status(400).json({ msg: "Contract number already exists" });

    const date = new Date(startDate);
    req.body.contractNo = contract;
    req.body.billToAddress.name = capitalLetter(req.body.billToAddress.name);
    req.body.shipToAddress.name = capitalLetter(req.body.shipToAddress.name);
    req.body.preferred.day = capitalLetter(req.body.preferred.day);
    req.body.startDate = new Date(startDate);
    req.body.endDate = new Date(
      date.getFullYear(),
      date.getMonth() + Number(endDate),
      date.getDate()
    );
    req.body.serviceStartDate = new Date(req.body.serviceStartDate);

    const newContract = await Contract.create(req.body);

    return res
      .status(201)
      .json({ id: newContract._id, msg: "New contract created" });
  } catch (error) {
    console.log(error);
    res.send(500).json({ msg: "Server error, try again later" });
  }
};
