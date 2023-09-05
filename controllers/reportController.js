import Report from "../models/reportModel.js";
import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import mongoose from "mongoose";
import { sendEmail, uploadFile } from "../utils/helper.js";
import exceljs from "exceljs";
import moment from "moment";
import Admin from "../models/adminModel.js";
import axios from "axios";
import SibApiV3Sdk from "@getbrevo/brevo";

// let defaultClient = SibApiV3Sdk.ApiClient.instance;

// let apiKey = defaultClient.authentications["api-key"];
// apiKey.apiKey = process.env.BREVO_API_KEY;

// let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

export const addServiceData = async (req, res) => {
  const { contract: contractId, service: serviceId } = req.body;
  try {
    const contractExist = await Contract.findById(contractId);
    if (!contractExist)
      return res.status(404).json({ msg: "Contract not found, contact admin" });

    const serviceExist = await Service.findById(serviceId);
    if (!serviceExist)
      return res.status(404).json({ msg: "Service not found, contact admin" });

    const imageLinks = [];
    if (req.files) {
      let images = [];
      if (req.files.images.length > 0) images = req.files.images;
      else images.push(req.files.images);

      for (let i = 0; i < images.length; i++) {
        const filePath = images[i].tempFilePath;
        const link = await uploadFile({ filePath });
        if (!link)
          return res
            .status(400)
            .json({ msg: "Upload error, please try again later" });

        imageLinks.push(link);
      }
    }

    req.body.image = imageLinks;
    req.body.serviceDate = new Date(req.body.serviceDate);
    req.body.serviceBy = req.user.name;
    req.body.user = req.user._id;

    const tempEmails = new Set();
    contractExist.billToDetails.contact.map(
      (item) => item.email && tempEmails.add(item.email)
    );
    contractExist.shipToDetails.contact.map(
      (item) => item.email && tempEmails.add(item.email)
    );
    const emailList = [...tempEmails];

    const attachObj = [];
    for (let i = 0; i < imageLinks.length; i++) {
      const result = await axios.get(imageLinks[i], {
        responseType: "arraybuffer",
      });
      const base64File = Buffer.from(result.data, "binary").toString("base64");

      attachObj.push({
        content: base64File,
        filename: `image-${i + 1}.jpg`,
        type: `application/jpg`,
        disposition: "attachment",
      });
    }

    const dynamicData = {
      contractNo: req.body.contractNo,
      shipToAddress: `${contractExist.shipToDetails.address} ${contractExist.shipToDetails.city} - ${contractExist.shipToDetails.pincode}`,
      serviceName: req.body.serviceName,
      serviceType: req.body.serviceType,
      serviceDate: moment(req.body.serviceDate).format("DD/MM/YYYY"),
      serviceStatus: req.body.serviceStatus,
      serviceComment: req.body.serviceComment,
    };

    await Report.create(req.body);

    // sendSmtpEmail.sender = { name: "Epcorn", email: "exteam.epcorn@gmail.com" };
    // sendSmtpEmail.to = [
    //   { email: "noreply.epcorn@gmail.com", name: "Jane Doe" },
    // ];
    // sendSmtpEmail.params = {
    //   contractNo: "K/12",
    // };
    // sendSmtpEmail.templateId = 1;
    // sendSmtpEmail.attachmentUrl = [
    //   {
    //     url: "https://res.cloudinary.com/epcorn/image/upload/v1690795034/signature/Screenshot_2023-07-31_144131_agwhab.png", // Should be publicly available and shouldn't be a local file
    //     name: "myAttachment.png",
    //   },
    // ];
    // apiInstance.sendTransacEmail(sendSmtpEmail).then(
    //   function (data) {
    //     console.log(
    //       "API called successfully. Returned data: " + JSON.stringify(data)
    //     );
    //   },
    //   function (error) {
    //     console.error(error);
    //   }
    // );

    const mailSent = await sendEmail({
      emailList,
      attachObj,
      templateId: "d-ebb9f0ccce80432dba009696fe455382",
      dynamicData,
    });

    if (!mailSent)
      return res.status(400).json({ msg: "Email not sent, try again later" });

    res.status(201).json({ msg: "Report submitted & Email Sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const generateReport = async (req, res) => {
  const { id } = req.body;
  try {
    const report = await Report.find({
      service: new mongoose.Types.ObjectId(id),
    });
    if (!report.length) return res.status(400).json({ msg: "No data found" });

    if (report.length) {
      const workbook = new exceljs.Workbook();
      let worksheet = workbook.addWorksheet("Sheet1");

      worksheet.columns = [
        { header: "Contract Number", key: "contractNo" },
        { header: "Service Name", key: "serviceName" },
        { header: "Service Type", key: "serviceType" },
        { header: "Service Status", key: "serviceStatus" },
        { header: "Service Date", key: "serviceDate" },
        { header: "Technician Comment", key: "serviceComment" },
        { header: "Technician Name", key: "serviceBy" },
        { header: "Image 1", key: "image1" },
        { header: "Image 2", key: "image2" },
        { header: "Image 3", key: "image3" },
      ];

      report.map((item) => {
        worksheet.addRow({
          contractNo: item.contractNo,
          serviceName: item.serviceName,
          serviceType: item.serviceType,
          serviceStatus: item.serviceStatus,
          serviceDate: item.serviceDate,
          serviceComment: item.serviceComment,
          serviceBy: item.serviceBy,
          image1:
            (item.image.length >= 1 && {
              text: "Download",
              hyperlink: item.image[0],
            }) ||
            "No Image",
          image2:
            (item.image.length >= 2 && {
              text: "Download",
              hyperlink: item.image[1],
            }) ||
            "No Image",
          image3:
            (item.image.length >= 3 && {
              text: "Download",
              hyperlink: item.image[2],
            }) ||
            "No Image",
        });
      });

      const filePath = "./tmp/serviceReport.xlsx";
      await workbook.xlsx.writeFile(filePath);
      const link = await uploadFile({ filePath });

      return res.status(201).json({ msg: "Report Generated", link });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const clientReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await Report.find({
      service: new mongoose.Types.ObjectId(id),
    }).select("-image -contract");

    if (!report.length) return res.status(404).json({ msg: "No data found" });

    return res.json(report);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const serviceNotification = async (req, res) => {
  try {
    const date = moment().add(7, "days").format("DD/MM/YYYY");

    const emailList = [
      "contact@pestmanagements.in",
      "solution@pestmanagements.in",
    ];

    const services = await Service.find({
      serviceDates: { $in: date },
    }).populate({
      path: "contract",
      select: "contractNo active shipToDetails",
      match: { active: true },
    });

    if (!services.length) {
      const mailSent = await sendEmail({
        emailList: emailList,
        attachObj: [],
        templateId: "d-80c1a47b2e014671aa2f536409ee4504",
        dynamicData: {
          date: date,
          description: `No services schedule on ${date}`,
        },
      });

      if (!mailSent) {
        console.log("Email not sent");
      }
      return res.status(404).json({ msg: `No services schedule on ${date}` });
    }

    const workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = [
      { header: "Contract Number", key: "contract" },
      { header: "Service Name", key: "serviceName" },
      { header: "Frequency", key: "frequency" },
      { header: "Client Name", key: "name" },
      { header: "Service Address", key: "address" },
      { header: "Service Area", key: "area" },
      { header: "Service City", key: "city" },
      { header: "Pincode", key: "pincode" },
    ];

    for (let service of services) {
      if (service.contract) {
        worksheet.addRow({
          contract: service.contract.contractNo,
          serviceName: service.services.map((item) => item.label).join(", "),
          frequency: service.frequency,
          name: service.contract.shipToDetails.name,
          address: service.contract.shipToDetails.address,
          area: service.contract.shipToDetails.area,
          city: service.contract.shipToDetails.city,
          pincode: service.contract.shipToDetails.pincode,
        });
      }
    }
    const filePath = "./tmp/serviceDue.xlsx";
    await workbook.xlsx.writeFile(filePath);
    const link = await uploadFile({ filePath });

    const result = await axios.get(link, {
      responseType: "arraybuffer",
    });
    const base64File = Buffer.from(result.data, "binary").toString("base64");

    const attachObj = [
      {
        content: base64File,
        filename: `${date}.xlsx`,
        type: `application/xlsx`,
        disposition: "attachment",
      },
    ];

    const mailSent = await sendEmail({
      emailList: emailList,
      attachObj,
      templateId: "d-80c1a47b2e014671aa2f536409ee4504",
      dynamicData: {
        date: date,
        description: `Please find the attachment of services schedule on ${date}`,
      },
    });

    if (!mailSent) console.log("Email not sent");

    return res.status(200).json({ msg: "Service due file generated", link });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const dailyServices = async (req, res) => {
  try {
    const date = moment().format("DD/MM/YYYY");

    const services = await Service.find({
      serviceDates: { $in: date },
    }).populate({
      path: "contract",
      select: "contractNo shipToDetails",
    });

    return res.json(services);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const allStats = async (req, res) => {
  try {
    const services = await Service.find();
    const allMonths = moment.monthsShort();
    const year = moment().format("YY");
    const obj = new Map();

    services.map((item) =>
      item.serviceMonths.map((month) => obj.set(month, obj.get(month) + 1 || 1))
    );

    const dataSheet = {};
    allMonths.map((item) => {
      const month = `${item} ${year}`;
      dataSheet[month] = obj.get(month) || 0;
    });

    return res.json(dataSheet);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const monthlyServiceDue = async (req, res) => {
  try {
    const month = moment(req.body.month).format("MMM YY");
    const services = await Service.find({
      serviceMonths: { $in: [month] },
    }).populate({
      path: "contract",
      select: "contractNo shipToDetails active",
    });

    if (!services.length) return res.status(404).json({ msg: "No data found" });

    const workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = [
      { header: "Contract Number", key: "contract" },
      { header: "Contract Status", key: "status" },
      { header: "Service Name", key: "serviceName" },
      { header: "Frequency", key: "frequency" },
      { header: "Clinet Name", key: "name" },
      { header: "Service Address", key: "address" },
    ];

    for (let service of services) {
      if (service.contract) {
        worksheet.addRow({
          contract: service.contract.contractNo,
          status: service.contract.active ? "Active" : "Deactive",
          serviceName: service.services.map((item) => item.label).join(", "),
          frequency: service.frequency,
          name: service.contract.shipToDetails.name,
          address: `${service.contract.shipToDetails.address}, ${service.contract.shipToDetails.city} - ${service.contract.shipToDetails.pincode}`,
        });
      }
    }
    const filePath = `./tmp/${month} serviceDue.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    const link = await uploadFile({ filePath });
    if (!link) return res.status(400).json({ msg: "File generation error" });

    return res.status(200).json({ link });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
