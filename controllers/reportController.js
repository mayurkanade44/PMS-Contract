import exceljs from "exceljs";
import moment from "moment";
import mongoose from "mongoose";
import Contract from "../models/contractModel.js";
import Report from "../models/reportModel.js";
import Service from "../models/serviceModel.js";
import { sendBrevoEmail, uploadFile } from "../utils/helper.js";

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

    const dynamicData = {
      contractNo: req.body.contractNo,
      link: `${process.env.WEBSITE}/report/${serviceId}`,
      serviceName: req.body.serviceName,
      serviceType: req.body.serviceType,
      serviceDate: moment(req.body.serviceDate).format("DD/MM/YYYY"),
      serviceStatus: req.body.serviceStatus,
      serviceComment: req.body.serviceComment,
    };

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
    }).populate({ path: "contract", select: "shipToDetails" });
    if (!report.length) return res.status(400).json({ msg: "No data found" });

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile("./tmp/report.xlsx");
    let worksheet = workbook.getWorksheet("Sheet1");

    for (let i = 0; i < report.length; i++) {
      let row = worksheet.getRow(i + 4);
      let item = report[i];
      row.getCell(1).value = item.contractNo;
      row.getCell(2).value = item.contract.shipToDetails.name;
      row.getCell(3).value = item.serviceName;
      row.getCell(4).value = item.serviceType;
      row.getCell(5).value = item.serviceStatus;
      row.getCell(6).value = item.serviceDate;
      row.getCell(7).value = item.serviceComment;
      row.getCell(8).value = item.serviceBy;
      row.getCell(9).value =
        (item.image.length >= 1 && {
          text: "Download",
          hyperlink: item.image[0],
        }) ||
        "No Image";
      row.getCell(10).value =
        (item.image.length >= 2 && {
          text: "Download",
          hyperlink: item.image[1],
        }) ||
        "No Image";
      row.getCell(11).value =
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
      { header: "Service Date", key: "serviceDate" },
      { header: "Business Type", key: "business" },
      { header: "Service Name", key: "serviceName" },
      { header: "Frequency", key: "frequency" },
      { header: "Client Name", key: "name" },
      { header: "Contact Number", key: "number" },
      { header: "Contact Email", key: "email" },
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
          serviceDate: date,
          business: service.contract.business,
          serviceName: service.services.map((item) => item.label).join(", "),
          frequency: service.frequency,
          name: service.contract.shipToDetails.name,
          number: service.contract.shipToDetails.contact[0].number,
          email: service.contract.shipToDetails.contact[0].email,
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
      select: "contractNo active shipToDetails",
      match: { active: true },
    });

    const activeServices = services.filter((ser) => ser.contract);

    return res.json(activeServices);
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
    const startDate = moment(req.body.month, "YYYY-MM").startOf("month");
    const endDate = moment(req.body.month, "YYYY-MM").endOf("month");

    const month = moment(req.body.month).format("MMM YY");
    const services = await Service.find({
      serviceMonths: { $in: [month] },
    }).populate({
      path: "contract",
      select: "contractNo shipToDetails active business",
    });

    if (!services.length) return res.status(404).json({ msg: "No data found" });

    const reports = await Report.find({
      serviceDate: { $gt: startDate, $lt: endDate },
      serviceType: "Regular",
      serviceStatus: "Completed",
    }).select("service");

    const workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = [
      { header: "Contract Number", key: "contract" },
      { header: "Contract Status", key: "status" },
      { header: "Business Type", key: "business" },
      { header: "Client Name", key: "name" },
      { header: "Client Number", key: "number" },
      { header: "Client Email", key: "email" },
      { header: "Service Name", key: "serviceName" },
      { header: "Frequency", key: "frequency" },
      { header: "Service Address", key: "address" },
      { header: "Instructions", key: "instructions" },
    ];

    for (let service of services) {
      if (service.contract) {
        let rep = [];
        reports.map(
          (item) =>
            item.service.toString() === service._id.toString() &&
            !rep.includes(item.serviceDate) &&
            rep.push(item.serviceDate)
        );

        const dates =
          service.serviceDates.filter(
            (date) => moment(date, "DD/MM/YYYY").format("MMM YY") === month
          ).length - rep.length;

        if (dates > 0) {
          for (let i = 0; i < dates; i++) {
            worksheet.addRow({
              contract: service.contract.contractNo,
              business: service.contract.business,
              status: service.contract.active ? "Active" : "Deactive",
              serviceName: service.services
                .map((item) => item.label)
                .join(", "),
              frequency: service.frequency,
              name: service.contract.shipToDetails.name,
              number: service.contract.shipToDetails.contact[0].number,
              email: service.contract.shipToDetails.contact[0].email,
              address: `${service.contract.shipToDetails.address}, ${service.contract.shipToDetails.city} - ${service.contract.shipToDetails.pincode}`,
              instructions: service.instruction,
            });
          }
        }
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
    const month = moment().subtract(1, "month").format("MMM YY");

    const reportData = await Contract.find({
      quarterlyMonths: { $in: [month] },
      active: true,
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

    let count = 0;

    for (let data of reportData) {
      if (data.reports.length > 0) {
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
        if (link) {
          count++;
          await Contract.findByIdAndUpdate(
            data._id,
            { quarterlyReport: link },
            { runValidators: true, new: true }
          );
        }
      }
    }

    return res.status(200).json({ msg: "Quarterly Report Generated", count });
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
    const end = moment().subtract(1, "month").format("MMM YY");
    const start = moment().subtract(3, "months").format("MMM YY");

    if (!reports.length)
      return res.status(400).json({ msg: "No report found" });

    let emailCount = 0;

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

      const dynamicData = {
        contractNo: report.contractNo,
        start,
        end,
      };

      const mailSent = await sendBrevoEmail({
        emailList,
        attachment: [{ url: report.quarterlyReport, name: `${fileName}.xlsx` }],
        templateId: 4,
        dynamicData,
      });

      if (mailSent) {
        emailCount += 1;
        await Contract.findByIdAndUpdate(
          report._id,
          { quarterlyReport: null },
          { new: true, runValidators: true }
        );
      }
    }

    res.status(200).json({ msg: "Report sent", emailCount });
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
    }).populate({ path: "services", select: "services frequency" });

    if (contracts.length < 1)
      return res
        .status(404)
        .json({ msg: "No contracts found during given dates" });

    const workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = [
      { header: "Contract Number", key: "contract" },
      { header: "Contract Status", key: "status" },
      { header: "Client Name", key: "name" },
      { header: "Bill Address", key: "address" },
      { header: "Area", key: "area" },
      { header: "Pincode", key: "pincode" },
      { header: "Contact Details", key: "contact" },
      // { header: "Service Name", key: "service" },
      // { header: "Service Frequency", key: "frequency" },
      { header: "Start Date", key: "start" },
      { header: "End Date", key: "end" },
      { header: "Total Cost", key: "cost" },
      { header: "Business Type", key: "business" },
    ];

    for (let contract of contracts) {
      // const services = contract.services.map((item) =>
      //   item.services.map((ser) => ser.label)
      // );

      worksheet.addRow({
        contract: contract.contractNo,
        status: contract.active ? "Active" : "Deactive",
        address: `${contract.billToDetails.address}`,
        area: `${contract.billToDetails.area}`,
        pincode: `${contract.billToDetails.pincode}`,
        contact: `${contract.billToDetails.contact[0].number} / ${contract.billToDetails.contact[0].email}`,
        // service: services,
        // frequency: contract.services.map((item) => item.frequency),
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
