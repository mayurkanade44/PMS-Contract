import moment from "moment/moment.js";
import Schedule from "../models/scheduleModel.js";
import Service from "../models/serviceModel.js";
import User from "../models/userModel.js";
import Contract from "../models/contractModel.js";
import { sendBrevoEmail } from "../utils/helper.js";

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
    if (req.body.contact) {
      contacts += req.body.contact;
    }
    const emailList = [];
    clientDetails.contact.map(
      (item) =>
        item.email &&
        !emailList.some((i) => i.email === item.email) &&
        emailList.push({ email: item.email })
    );

    await Schedule.create({
      contractNo: serviceDetails.contract.contractNo,
      clientName: clientDetails.name,
      clientAddress: `${clientDetails.address}, ${clientDetails.nearBy}, ${clientDetails.area}, ${clientDetails.city}, ${clientDetails.pincode}`,
      clientContact: contacts,
      clientEmail: emailList,
      serviceName: serviceDetails.services.map((service) => service.label),
      serviceType: "complaint",
      scheduleType: "byClient",
      raiseBy: clientDetails.name,
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
  const {
    search,
    page,
    serviceType,
    scheduleType,
    jobStatus,
    date,
    technician,
    time,
    pincode,
  } = req.query;

  //filtering
  let query = {};
  let sort = "-createdAt";
  if (search) {
    query = {
      $or: [
        { contractNo: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
      ],
    };
  }
  if (date) {
    query.date = new Date(date);
    sort = "time.value";
  }
  if (serviceType && serviceType != "all") {
    query.serviceType = serviceType;
  }
  if (scheduleType && scheduleType !== "all") {
    query.scheduleType = scheduleType;
  }
  if (jobStatus && jobStatus !== "all") {
    query.jobStatus = jobStatus;
  }
  if (technician && technician !== "all") {
    query.technician = technician;
    sort = "time.value";
  }
  if (time && time !== "all") {
    query["time.value"] = Number(time);
  }
  if (pincode && pincode !== "all") {
    query.clientAddress = { $regex: pincode, $options: "i" };
  }

  let pageNumber = Number(page) || 1;
  try {
    const count = await Schedule.countDocuments({ ...query });

    const schedules = await Schedule.find(query)
      .populate({
        path: "technician",
        select: "name",
      })
      .sort(sort)
      .skip(20 * (pageNumber - 1))
      .limit(20);

    return res
      .status(200)
      .json({ schedules, pages: Math.min(10, Math.ceil(count / 20)) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const updateSchedule = async (req, res) => {
  const {
    contractNo,
    clientName,
    clientAddress,
    clientContact,
    technician,
    scheduleType,
    raiseBy,
  } = req.body;
  const { id } = req.params;
  if (
    !contractNo ||
    !clientName ||
    !clientAddress ||
    !clientContact ||
    !technician ||
    !scheduleType ||
    !raiseBy
  )
    return res.status(400).json({ msg: "Please provide required details" });

  try {
    const scheduler = await Schedule.findById(id);
    if (!scheduler) {
      res.status(400).json({ msg: "Request not found" });
    }
    if (scheduler.contractNo !== contractNo) {
      return res
        .status(400)
        .json({ msg: "Contract number change not allowed" });
    }
    req.body.date = new Date(req.body.date);

    //email confirmation
    if (
      (scheduleType == "byClient" || scheduleType == "confirmed") &&
      (!scheduler.emailSent ||
        req.body.date.toString() != scheduler.date.toString())
    ) {
      const dynamicData = {
        contractNo,
        serviceDate: moment(req.body.date).format("DD/MM/YYYY"),
        serviceTime: req.body.time.label,
        serviceName: req.body.serviceName.toString(),
        serviceType:
          req.body.serviceType.charAt(0).toUpperCase() +
          req.body.serviceType.slice(1),
      };
      // await sendBrevoEmail({
      //   emailList: scheduler.clientEmail,
      //   templateId: 6,
      //   dynamicData,
      // });
    }

    req.body.emailSent = true;

    await Schedule.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res
      .status(200)
      .json({ msg: "Schedule is updated & confirmation email is sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getAllTechnicians = async (req, res) => {
  const { date, time } = req.query;

  try {
    const users = await User.find({ role: "Technician" });
    const allUsers = users.map((user) => ({
      value: user._id,
      label: user.name,
    }));
    let technicians;
    if (time && date) {
      const schedules = await Schedule.find({
        date: new Date(date),
        "time.value": Number(time),
        scheduleType: "confirmed",
      }).select("technician");

      const confirmedUserIds = new Set(
        schedules.map((schedule) => schedule.technician.toString())
      );

      technicians = allUsers.filter(
        (user) => !confirmedUserIds.has(user.value.toString())
      );
    } else {
      technicians = allUsers;
    }

    return res.json(technicians);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const searchContract = async (req, res) => {
  const { search } = req.query;
  try {
    if (!search)
      return res.status(400).json({ msg: "Please provide contract number" });

    const contract = await Contract.findOne({
      contractNo: search.toUpperCase(),
    }).populate({
      path: "services",
      select: "services",
    });
    if (!contract)
      return res.status(404).json({ msg: "Client details not found" });

    let clientContact = "";
    contract.shipToDetails.contact.map(
      (item) => item.number.length > 0 && (clientContact += item.number + ", ")
    );
    const emailList = [];
    contract.shipToDetails.contact.map(
      (item) =>
        item.email &&
        !emailList.some((i) => i.email === item.email) &&
        emailList.push({ email: item.email })
    );
    let services = [];
    contract.services.map((item) =>
      item.services.map((service) =>
        services.push({ value: item._id, label: service.label })
      )
    );

    const contractDetails = {
      contractNo: contract.contractNo,
      clientName: contract.shipToDetails.name,
      clientContact,
      services,
      clientAddress: `${contract.shipToDetails.address}, ${contract.shipToDetails.nearBy}, ${contract.shipToDetails.area}, ${contract.shipToDetails.city}, ${contract.shipToDetails.pincode}`,
      emailList,
    };

    return res.json(contractDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const addScheduleByPms = async (req, res) => {
  const {
    contractNo,
    clientName,
    clientAddress,
    clientContact,
    date,
    serviceName,
    scheduleType,
    technician,
    raiseBy,
    serviceType,
    time,
  } = req.body;

  if (
    !contractNo ||
    !clientName ||
    !clientAddress ||
    !clientContact ||
    !date ||
    serviceName.length < 1 ||
    !technician ||
    !time ||
    !serviceType ||
    !raiseBy
  )
    return res.status(400).json({ msg: "Please provide required details" });

  try {
    let scheduleDate = new Date(date);
    const alreadyScheduled = await Schedule.findOne({
      contractNo,
      date: scheduleDate,
      serviceName,
    });
    if (alreadyScheduled) {
      return res.status(400).json({
        msg: `Service is already schedule on ${moment(date).format(
          "DD/MM/YYYY"
        )}`,
      });
    }

    req.body.date = scheduleDate;
    let emailSent = true;
    let responseMessage = "New schedule is added & Confirmation email is sent";

    const dynamicData = {
      contractNo,
      serviceDate: moment(date).format("DD/MM/YYYY"),
      serviceTime: time.label,
      serviceName: serviceName.toString(),
      serviceType: serviceType.charAt(0).toUpperCase() + serviceType.slice(1),
    };
    // const email = await sendBrevoEmail({
    //   emailList: req.body.clientEmail,
    //   templateId: 6,
    //   dynamicData,
    // });
    // if (!email) {
    //   emailSent = false;
    //   responseMessage =
    //     "New schedule is added but Confirmation email is not sent";
    // }

    await Schedule.create({
      contractNo,
      clientName,
      clientAddress,
      clientContact,
      clientEmail: req.body.clientEmail,
      serviceName,
      serviceType,
      scheduleType,
      date: scheduleDate,
      time,
      raiseBy,
      service: req.body.service,
      technician,
      jobDuration: req.body.jobDuration,
      assistantTechnician: req.body.assistantTechnician,
      instruction: req.body.instruction,
      emailSent,
    });

    return res.status(201).json({ msg: responseMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getTechnicianSchedules = async (req, res) => {
  try {
    const date = new Date(req.query.date);
    const schedules = await Schedule.find({
      date,
      scheduleType: { $ne: "cancelled" },
      technician: req.user._id,
    }).sort("time.value");

    return res.json(schedules);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const generateSchedule = async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ msg: "Please provide valid date" });
  try {
    const schedules = await Schedule.find({
      date: new Date(date),
      scheduleType: "confirmed",
    })
      .populate({
        path: "technician",
        select: "name",
      })
      .sort("technician");

    const template = fs.readFileSync("./tmp/scheduleTemp.docx");
    const buffer = await createReport({
      cmdDelimiter: ["{", "}"],
      template,

      additionalJsContext: {},
    });

    console.log(schedules);
    return res.json(schedules);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
