import moment from "moment/moment.js";
import Schedule from "../models/scheduleModel.js";
import Service from "../models/serviceModel.js";

export const addScheduleByClient = async (req, res) => {
  const { date, time, serviceId } = req.body;
  if (!date || !time)
    return res.status(400).json({ msg: "Please provide all the details" });

  try {
    const serviceDetails = await Service.findById(serviceId).populate({
      path: "contract",
      select: "contractNo shipToDetails active tenure",
    });
    if (!serviceDetails)
      return res.status(404).json({ msg: "Service not found" });

    if (!serviceDetails.contract.active) {
      return res
        .status(400)
        .json({ msg: "Your contract is not active. Please contact PMS team." });
    }

    let currentDate = new Date();
    if (currentDate > serviceDetails.contract.tenure.endDate) {
      return res
        .status(400)
        .json({ msg: "Your contract is expired. Please contact PMS team." });
    }

    let scheduleDate = new Date(date);
    if (scheduleDate > serviceDetails.contract.tenure.endDate) {
      return res.status(400).json({
        msg: "Selected date is after contract end, please select another date or contact PMS team.",
      });
    }

    const alreadyScheduled = await Schedule.findOne({
      contractNo: serviceDetails.contract.contractNo,
      date: scheduleDate,
      serviceName: serviceDetails.services.map((service) => service.label),
    });
    if (alreadyScheduled) {
      return res.status(400).json({
        msg: `Service is already schedule on ${moment(date).format(
          "DD/MM/YYYY"
        )}`,
      });
    }

    const clientDetails = serviceDetails.contract.shipToDetails;
    let contacts = "";
    clientDetails.contact.map(
      (item) => item.number.length > 0 && (contacts += item.number + ", ")
    );
    await Schedule.create({
      contractNo: serviceDetails.contract.contractNo,
      clientName: clientDetails.name,
      clientAddress: `${clientDetails.address}, ${clientDetails.nearBy}, ${clientDetails.area}, ${clientDetails.city}, ${clientDetails.pincode}`,
      clientContact: contacts,
      serviceName: serviceDetails.services.map((service) => service.label),
      serviceType: "complaint",
      scheduleType: "tentative",
      date: scheduleDate,
      time,
      service: serviceId,
    });

    return res.status(201).json({
      msg: "Service has been requested, you will be contacted by PMS team. Thank You.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
