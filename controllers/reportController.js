import Report from "../models/reportModel.js";
import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import mongoose from "mongoose";
import { sendEmail, uploadFile } from "../utils/helper.js";
import exceljs from "exceljs";
import moment from "moment";
import Admin from "../models/adminModel.js";
import axios from "axios";

export const addServiceData = async (req, res) => {
  const { contract: contractId, service: serviceId } = req.body;
  try {
    const contractExist = await Contract.findById(contractId);
    if (!contractExist)
      return res.status(404).json({ msg: "Contract not found, contact admin" });

    const serviceExist = await Service.findById(serviceId);
    if (!serviceExist)
      return res.status(404).json({ msg: "Contract not found, contact admin" });

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

    const tempEmails = new Set();
    contractExist.billToContact.map(
      (item) => item.email && tempEmails.add(item.email)
    );
    contractExist.shipToContact.map(
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
      serviceName: req.body.serviceName,
      serviceType: req.body.serviceType,
      serviceDate: req.body.serviceDate,
      serviceStatus: req.body.serviceStatus,
      serviceComment: req.body.serviceComment,
    };

    
    await Report.create(req.body);

    const mailSent = await sendEmail({
      emailList,
      attachObj,
      templateId: "d-ebf14fa28bf5478ea134f97af409b1b7",
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

    const services = await Service.find({
      serviceDates: { $in: date },
    }).populate({
      path: "contract",
      select: "contractNo active billToAddress shipToAddress",
      match: { active: true },
    });

    if (!services.length) return res.status(404).json({ msg: "No data found" });

    const workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = [
      { header: "Contract Number", key: "contract" },
      { header: "Service Name", key: "serviceName" },
      { header: "Frequency", key: "frequency" },
      { header: "Ship To Name", key: "name" },
    ];

    for (let service of services) {
      if (service.contract) {
        worksheet.addRow({
          contract: service.contract.contractNo,
          serviceName: service.services.map((item) => item.label).join(", "),
          frequency: service.frequency,
          name: service.contract.shipToAddress.name,
        });
      }
    }
    const filePath = "./tmp/serviceDue.xlsx";
    await workbook.xlsx.writeFile(filePath);
    const link = await uploadFile({ filePath });

    await Admin.findOneAndUpdate(
      { _id: "64e1d5a78fbf8a07b23a0b99" },
      { notificationFile: link },
      { runValidators: true, new: true }
    );

    return res.status(200).json({ msg: "Notification File generated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const sendServiceNotification = async (req, res) => {
  try {
    const file = await Admin.findById("64e1d5a78fbf8a07b23a0b99");
    if (file.notificationFile === "No File")
      return res.status(404).json({ msg: "Fle not found" });

    const fileName = moment().add(7, "days").format("DD-MM-YYYY");
    const result = await axios.get(file.notificationFile, {
      responseType: "arraybuffer",
    });
    const base64File = Buffer.from(result.data, "binary").toString("base64");

    const attachObj = [
      {
        content: base64File,
        filename: `${fileName}.xlsx`,
        type: `application/xlsx`,
        disposition: "attachment",
      },
    ];

    const mailSent = await sendEmail({
      emailList: ["mayurkanade44@gmail.com"],
      attachObj,
      templateId: "d-ebf14fa28bf5478ea134f97af409b1b7",
      dynamicData: { start: fileName },
    });

    if (!mailSent)
      return res.status(400).json({ msg: "Email not sent, try again later" });

    await Admin.findOneAndUpdate(
      { _id: "64e1d5a78fbf8a07b23a0b99" },
      { notificationFile: "No File" },
      { runValidators: true, new: true }
    );

    return res.status(200).json({ msg: "Email Sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
