import Report from "../models/reportModel.js";
import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import mongoose from "mongoose";
import { sendBrevoEmail, sendEmail, uploadFile } from "../utils/helper.js";
import exceljs from "exceljs";
import moment from "moment";
import axios from "axios";
import fs from "fs";

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
    const attachment = [];
    if (req.files) {
      let images = [];
      if (req.files.images.length > 0) images = req.files.images;
      else images.push(req.files.images);

      for (let i = 0; i < images.length; i++) {
        const filePath = images[i].tempFilePath;
        const link = await uploadFile({ filePath, folder: "images" });
        if (!link)
          return res
            .status(400)
            .json({ msg: "Upload error, please try again later" });

        imageLinks.push(link);
        attachment.push({ url: link, name: `image-${i + 1}.jpg` });
      }
    }

    req.body.image = imageLinks;
    req.body.serviceDate = new Date(req.body.serviceDate);
    req.body.serviceBy = req.user.name;
    req.body.user = req.user._id;

    const emailList = [];
    contractExist.billToDetails.contact.map(
      (item) =>
        item.email &&
        !emailList.some((i) => i.email === item.email) &&
        emailList.push({ email: item.email })
    );
    contractExist.shipToDetails.contact.map(
      (item) =>
        item.email &&
        !emailList.some((i) => i.email === item.email) &&
        emailList.push({ email: item.email })
    );

    // const attachObj = [];
    // for (let i = 0; i < imageLinks.length; i++) {
    //   const result = await axios.get(imageLinks[i], {
    //     responseType: "arraybuffer",
    //   });
    //   const base64File = Buffer.from(result.data, "binary").toString("base64");

    //   attachObj.push({
    //     content: base64File,
    //     filename: `image-${i + 1}.jpg`,
    //     type: `application/jpg`,
    //     disposition: "attachment",
    //   });
    // }

    const dynamicData = {
      contractNo: req.body.contractNo,
      link: `${process.env.WEBSITE}/report/${serviceId}`,
      serviceName: req.body.serviceName,
      serviceType: req.body.serviceType,
      serviceDate: moment(req.body.serviceDate).format("DD/MM/YYYY"),
      serviceStatus: req.body.serviceStatus,
      serviceComment: req.body.serviceComment,
    };

    // const mailSent = await sendEmail({
    //   emailList,
    //   attachObj,
    //   templateId: "d-ebb9f0ccce80432dba009696fe455382",
    //   dynamicData,
    // });

    await Report.create(req.body);

    const mailSent = await sendBrevoEmail({
      emailList,
      attachment,
      templateId: 1,
      dynamicData,
    });

    if (!mailSent)
      return res.status(400).json({ msg: "Report saved but email not sent" });

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

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile("./tmp/report.xlsx");
    let worksheet = workbook.getWorksheet("Sheet1");

    for (let i = 0; i < report.length; i++) {
      let row = worksheet.getRow(i + 4);
      let item = report[i];
      row.getCell(1).value = item.contractNo;
      row.getCell(2).value = item.serviceName;
      row.getCell(3).value = item.serviceType;
      row.getCell(4).value = item.serviceStatus;
      row.getCell(5).value = item.serviceDate;
      row.getCell(6).value = item.serviceComment;
      row.getCell(7).value = item.serviceBy;
      row.getCell(8).value =
        (item.image.length >= 1 && {
          text: "Download",
          hyperlink: item.image[0],
        }) ||
        "No Image";
      row.getCell(9).value =
        (item.image.length >= 2 && {
          text: "Download",
          hyperlink: item.image[1],
        }) ||
        "No Image";
      row.getCell(10).value =
        (item.image.length >= 3 && {
          text: "Download",
          hyperlink: item.image[2],
        }) ||
        "No Image";
      row.commit();
    }

    const filePath = "./tmp/serviceReport.xlsx";
    await workbook.xlsx.writeFile(filePath);
    const link = await uploadFile({ filePath, folder: "reports" });

    return res.status(201).json({ msg: "Report Generated", link });
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
      { email: process.env.REPORT_EMAIL_1 },
      { email: process.env.REPORT_EMAIL_2 },
    ];

    const services = await Service.find({
      serviceDates: { $in: date },
    }).populate({
      path: "contract",
      select: "contractNo active shipToDetails business",
      match: { active: true },
    });

    if (!services.length) {
      // const mailSent = await sendEmail({
      //   emailList: emailList,
      //   attachObj: [],
      //   templateId: "d-80c1a47b2e014671aa2f536409ee4504",
      //   dynamicData: {
      //     date: date,
      //     description: `No services schedule on ${date}`,
      //   },
      // });

      const mailSent = await sendBrevoEmail({
        emailList,
        templateId: 5,
        dynamicData: {
          date: date,
          description: `No services schedule on ${date}`,
        },
      });

      if (!mailSent) console.log("Email not sent");

      return res.json({ msg: `No services schedule on ${date}` });
    }

    const workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = [
      { header: "Contract Number", key: "contract" },
      { header: "Business Type", key: "business" },
      { header: "Service Name", key: "serviceName" },
      { header: "Frequency", key: "frequency" },
      { header: "Client Name", key: "name" },
      { header: "Service Address", key: "address" },
      { header: "Service Area", key: "area" },
      { header: "Service City", key: "city" },
      { header: "Pincode", key: "pincode" },
      { header: "Reschedule Date", key: "date" },
      { header: "Reschedule Reason", key: "reason" },
    ];

    for (let service of services) {
      if (service.contract) {
        worksheet.addRow({
          contract: service.contract.contractNo,
          business: service.contract.business,
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
    const link = await uploadFile({ filePath, folder: "reports" });

    // const result = await axios.get(link, {
    //   responseType: "arraybuffer",
    // });
    // const base64File = Buffer.from(result.data, "binary").toString("base64");

    // const attachObj = [
    //   {
    //     content: base64File,
    //     filename: `${date}.xlsx`,
    //     type: `application/xlsx`,
    //     disposition: "attachment",
    //   },
    // ];

    // const mailSent = await sendEmail({
    //   emailList: emailList,
    //   attachObj,
    //   templateId: "d-80c1a47b2e014671aa2f536409ee4504",
    //   dynamicData: {
    //     date: date,
    //     description: `Please find the attachment of services schedule on ${date}`,
    //   },
    // });

    const mailSent = await sendBrevoEmail({
      emailList,
      attachment: [{ url: link, name: `${date}.xlsx` }],
      templateId: 5,
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
      select: "contractNo shipToDetails active business",
    });

    if (!services.length) return res.status(404).json({ msg: "No data found" });

    const workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = [
      { header: "Contract Number", key: "contract" },
      { header: "Contract Status", key: "status" },
      { header: "Business Type", key: "business" },
      { header: "Clinet Name", key: "name" },
      { header: "Service Name", key: "serviceName" },
      { header: "Frequency", key: "frequency" },
      { header: "Service Address", key: "address" },
    ];

    for (let service of services) {
      if (service.contract) {
        worksheet.addRow({
          contract: service.contract.contractNo,
          business: service.contract.business,
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
    const link = await uploadFile({ filePath, folder: "reports" });
    if (!link) return res.status(400).json({ msg: "File generation error" });

    return res.status(200).json({ link });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const quarterlyReport = async (req, res) => {
  try {
    const date = new Date();
    const quarter = new Date(
      date.getFullYear(),
      date.getMonth() - 3,
      date.getDate()
    );
    const month = moment().format("MMM YY");

    const reportData = await Contract.find({
      quarterlyMonths: { $in: [month] },
    })
      .populate({
        path: "reports",
        match: {
          serviceDate: {
            $gte: quarter,
            $lte: date,
          },
        },
      })
      .select("reports quarterlyMonths");

    if (!reportData.length)
      return res.status(400).json({ msg: "No data found" });

    for (let data of reportData) {
      if (data.reports.length) {
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.readFile("./tmp/quarterlyReport.xlsx");
        let worksheet = workbook.getWorksheet("Sheet1");

        for (let i = 0; i < data.reports.length; i++) {
          let row = worksheet.getRow(i + 4);
          let item = data.reports[i];
          row.getCell(1).value = item.contractNo;
          row.getCell(2).value = item.serviceName;
          row.getCell(3).value = item.serviceType;
          row.getCell(4).value = item.serviceStatus;
          row.getCell(5).value = item.serviceDate;
          row.getCell(6).value = item.serviceComment;
          row.getCell(7).value = item.serviceBy;
          row.commit();
        }

        const contractNo = data.reports[0].contractNo.replace(/\//g, "-");

        const filePath = `./tmp/${contractNo}_Quarterly_Service_Report.xlsx`;
        await workbook.xlsx.writeFile(filePath);
        const link = await uploadFile({ filePath, folder: "reports" });
        if (link)
          await Contract.findByIdAndUpdate(
            data._id,
            { quarterlyReport: link },
            { runValidators: true, new: true }
          );
      }
    }

    return res.status(200).json({ msg: "Report generated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const sendQuarterlyReport = async (req, res) => {
  try {
    const reports = await Contract.find({
      quarterlyReport: { $ne: null },
      active: true,
    });
    const end = moment().format("MMM YY");
    const start = moment().subtract(3, "months").format("MMM YY");

    if (!reports.length)
      return res.status(400).json({ msg: "No report found" });

    for (let report of reports) {
      const emailList = [];
      report.billToDetails.contact.map(
        (item) =>
          item.email &&
          !emailList.some((i) => i.email === item.email) &&
          emailList.push({ email: item.email })
      );
      report.shipToDetails.contact.map(
        (item) =>
          item.email &&
          !emailList.some((i) => i.email === item.email) &&
          emailList.push({ email: item.email })
      );

      const fileName = `${report.contractNo.replace(
        /\//g,
        "-"
      )}_Quarterly_Service_Report`;

      // const result = await axios.get(report.quarterlyReport, {
      //   responseType: "arraybuffer",
      // });
      // const base64File = Buffer.from(result.data, "binary").toString("base64");

      // const attachObj = [
      //   {
      //     content: base64File,
      //     filename: `${fileName}.xlsx`,
      //     type: `application/xlsx`,
      //     disposition: "attachment",
      //   },
      // ];

      const dynamicData = {
        contractNo: report.contractNo,
        start,
        end,
      };

      // const mailSent = await sendEmail({
      //   emailList,
      //   attachObj,
      //   templateId: "d-ebf14fa28bf5478ea134f97af409b1b7",
      //   dynamicData,
      // });

      const mailSent = await sendBrevoEmail({
        emailList,
        attachment: [{ url: report.quarterlyReport, name: `${fileName}.xlsx` }],
        templateId: 4,
        dynamicData,
      });

      if (mailSent) {
        await Contract.findByIdAndUpdate(
          report._id,
          { quarterlyReport: null },
          { new: true, runValidators: true }
        );
      }
    }

    res.status(200).json({ msg: "Report sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const expireContractsReport = async (req, res) => {
  const { startDate, endDate } = req.body;
  try {
    if (!startDate || !endDate)
      return res.status(400).json({ msg: "Expiry date is required" });

    const contracts = await Contract.find({
      "tenure.endDate": {
        $gte: startDate,
        $lte: endDate,
      },
    });

    if (contracts.length < 1)
      return res
        .status(404)
        .json({ msg: "No contracts found during given dates" });

    const workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = [
      { header: "Contract Number", key: "contract" },
      { header: "Client Name", key: "name" },
      { header: "Contract Status", key: "status" },
      { header: "Start Date", key: "start" },
      { header: "End Date", key: "end" },
      { header: "Total Cost", key: "cost" },
      { header: "Business Type", key: "business" },
    ];

    for (let contract of contracts) {
      worksheet.addRow({
        contract: contract.contractNo,
        status: contract.active ? "Active" : "Deactive",
        start: moment(contract.tenure.startDate).format("DD/MM/YY"),
        end: moment(contract.tenure.endDate).format("DD/MM/YY"),
        name: contract.billToDetails.name,
        cost: contract.cost,
        business: contract.business,
      });
    }
    const filePath = `./tmp/contractExpiry.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    const link = await uploadFile({ filePath, folder: "reports" });
    if (!link) return res.status(400).json({ msg: "File generation error" });

    return res.status(200).json({ link });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
