import moment from "moment/moment.js";
import Schedule from "../models/scheduleModel.js";
import Service from "../models/serviceModel.js";
import User from "../models/userModel.js";

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

export const getAllSchedules = async (req, res) => {
  const { search, page, serviceType, scheduleType, jobStatus, date, time } =
    req.query;

  //filtering
  let query = {
    scheduleType,
  };
  if (search) {
    query.contractNo = { $regex: search, $options: "i" };
  }
  if (date) {
    query.date = new Date(date);
  }
  if (serviceType && serviceType != "all") {
    query.serviceType = serviceType;
  }
  if (time && time !== "all") {
    query.time = time;
  }
  if (jobStatus && jobStatus !== "all") {
    query.jobStatus = jobStatus;
  }

  let pageNumber = Number(page) || 1;
  try {
    const count = await Schedule.countDocuments({ ...query });

    const schedules = await Schedule.find(query)
      .populate({
        path: "technician",
        select: "name",
      })
      .sort("-createdAt")
      .skip(15 * (pageNumber - 1))
      .limit(15);

    return res
      .status(200)
      .json({ schedules, pages: Math.min(10, Math.ceil(count / 15)) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const updateSchedule = async (req, res) => {
  const { contractNo, clientName, clientAddress, clientContact } = req.body;
  const { id } = req.params;
  if (!contractNo || !clientName || !clientAddress || !clientContact)
    return res.status(400).json({ msg: "Please provide required details" });

  try {
    const scheduler = await Schedule.findById(id);
    if (!scheduler) {
      res.status(400).json({ msg: "Requested service not found" });
    }
    if (scheduler.contractNo !== contractNo) {
      return res
        .status(400)
        .json({ msg: "Contract number change not allowed" });
    }
    req.body.date = new Date(req.body.date);

    await Schedule.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ msg: "Schedule service updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getAllTechnicians = async (req, res) => {
  try {
    const users = await User.find({ role: "Technician" });
    const formattedUsers = users.map((user) => ({
      value: user._id,
      label: user.name,
    }));

    return res.json(formattedUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
