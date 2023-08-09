import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import moment from "moment";

export const addCard = async (req, res) => {
  const { frequency, id } = req.body;
  try {
    const contract = await Contract.findById(id);
    if (!contract || !contract.active)
      return res.status(404).json({ msg: "Contract not found" });

    const serviceDates = [];
    const serviceMonths = [];
   
    let serviceStart = contract.serviceStartDate;
    const end = Math.floor(365 / frequency.days);

    for (let i = 0; i < end; i++) {
      serviceDates.push(moment(serviceStart).format("DD/MM/YYYY"));

      if (!serviceMonths.includes(moment(serviceStart).format("MMM YY"))) {
        serviceMonths.push(moment(serviceStart).format("MMM YY"));
      }

      serviceStart = new Date(
        serviceStart.getFullYear(),
        serviceStart.getMonth(),
        serviceStart.getDate() + frequency.days
      );
    }

    const service = await Service.create({
      frequency,
      serviceMonths,
      serviceDates,
      area: req.body.area,
      treatmentLocation: req.body.treatmentLocation,
      contract: id,
    });

    return res.json({ service });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
