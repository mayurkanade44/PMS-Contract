import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import moment from "moment";
import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";
import fs from "fs";
import { sendEmail, serviceDates, uploadFile } from "../utils/helper.js";
import { createReport } from "docx-templates";
import axios from "axios";

let cardId = null;

export const addCard = async (req, res) => {
  const { frequency, id, serviceStartDate } = req.body;
  try {
    const contract = await Contract.findById(id).populate("services");
    if (!contract || !contract.active)
      return res.status(404).json({ msg: "Contract not found" });

    const contractPeriod = `${moment(contract.tenure.startDate).format(
      "DD/MM/YYYY"
    )} To ${moment(contract.tenure.endDate).format("DD/MM/YYYY")}`;

    const due = serviceDates({
      frequency,
      serviceStartDate,
      contract: contract.tenure,
    });

    cardId = null;
    const service = await Service.create({
      frequency,
      serviceMonths: due.serviceMonths,
      serviceDates: due.serviceDates,
      area: req.body.area,
      treatmentLocation: req.body.treatmentLocation,
      contract: id,
      services: req.body.services,
      serviceStartDate,
    });

    cardId = service._id;
    const qrLink = `https://pms-contract.onrender.com/report/${service._id}`;

    //service qr image creation
    const serviceName = service.services.map((item) => item.label + ",");
    const buf = await qrCodeGenerator(qrLink, contract.contractNo, serviceName);
    if (!buf) {
      if (cardId) {
        await Service.findByIdAndDelete(cardId);
        cardId = null;
      }
      return res.status(400).json({ msg: "QR error, trg again later" });
    }

    //upload qr image
    const qrFilePath = "./tmp/cardQR.jpeg";
    fs.writeFileSync(qrFilePath, buf);
    const qrUrl = await uploadFile({ filePath: qrFilePath });
    if (!qrUrl) {
      if (cardId) {
        await Service.findByIdAndDelete(cardId);
        cardId = null;
      }
      return res.status(400).json({ msg: "Upload error, trg again later" });
    }

    //service card creation
    const cardQrCode = await QRCode.toDataURL(qrLink);
    const template = fs.readFileSync("./tmp/cardTemp.docx");

    const buffer = await createReport({
      cmdDelimiter: ["{", "}"],
      template,

      additionalJsContext: {
        contractNo: contract.contractNo,
        sales: contract.sales,
        card: contract.services?.length + 1 || 1,
        name: contract.shipToDetails.name,
        address: contract.shipToDetails.address,
        city: contract.shipToDetails.city,
        nearBy: contract.shipToDetails.nearBy,
        area: contract.shipToDetails.area,
        pincode: contract.shipToDetails.pincode,
        contact1: contract.shipToDetails.contact[0],
        contact2: contract.shipToDetails.contact[1],
        serviceDue: service.serviceMonths,
        service: service.services,
        frequency: service.frequency,
        location: service.treatmentLocation,
        area: service.area,
        billingFrequency: contract.billingFrequency,
        contractPeriod: contractPeriod,
        instruction: "Test",
        url: "12",
        qrCode: async (url12) => {
          const dataUrl = cardQrCode;
          const data = await dataUrl.slice("data:image/png;base64,".length);
          return { width: 2, height: 2, data, extension: ".png" };
        },
      },
    });

    const contractName = contract.contractNo.replace(/\//g, "-");
    const filename = `${contractName} ${service.frequency}`;
    const filePath = `./tmp/${filename}.docx`;
    fs.writeFileSync(filePath, buffer);
    const cardUrl = await uploadFile({ filePath });
    if (!cardUrl) {
      if (cardId) {
        await Service.findByIdAndDelete(cardId);
        cardId = null;
      }
      return res.status(400).json({ msg: "Upload error, trg again later" });
    }

    service.qr = qrUrl;
    service.card = cardUrl;
    await service.save();

    cardId = null;
    return res.json({ msg: "Service card added" });
  } catch (error) {
    //delete card if created
    if (cardId) {
      await Service.findByIdAndDelete(cardId);
      cardId = null;
    }
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

const qrCodeGenerator = async (link, contractNo, serviceName) => {
  try {
    let height = 230,
      width = 230,
      margin = 2;

    const qrCode = await QRCode.toDataURL(link, { width, height, margin });

    const canvas = createCanvas(width, height + 60);
    const ctx = canvas.getContext("2d");
    const qrCodeImg = await loadImage(qrCode);
    ctx.drawImage(qrCodeImg, 0, 25);

    // Add the bottom text to the canvas
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "12px Arial";
    ctx.textAlign = "start";
    ctx.fillText(`Contract Number: ${contractNo}`, 2, height + 40);
    ctx.fillText(`Service: ${serviceName}`, 2, height + 53);
    ctx.fillStyle = "rgb(32, 125, 192)";
    ctx.textAlign = "center";
    ctx.font = "italic bold 15px Arial";
    ctx.fillText(`Pest Management & Services`, width / 2, 17);

    const buf = canvas.toBuffer("image/jpeg");
    return buf;
  } catch (error) {
    console.log("Qr_Code", error);
    return false;
  }
};

export const updateCard = async (req, res) => {
  const { id, frequency, serviceCardId, serviceStartDate } = req.body;
  try {
    const service = await Service.findById(serviceCardId);
    if (!service)
      return res.status(404).json({ msg: "Service card not found" });

    const contract = await Contract.findById(id);
    if (!contract || !contract.active)
      return res.status(404).json({ msg: "Contract not found" });

    if (
      frequency !== service.frequency ||
      serviceStartDate !== service.serviceStartDate
    ) {
      const due = serviceDates({
        frequency,
        serviceStartDate,
        contract: contract.tenure,
      });

      req.body.serviceMonths = due.serviceMonths;
      req.body.serviceDates = due.serviceDates;
    }

    await Service.findByIdAndUpdate(serviceCardId, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ msg: "Service card updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const deleteCard = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    return res.json({ msg: "Service card has been deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const createDigitalContract = async (req, res) => {
  const { id: contractId } = req.params;
  try {
    const contract = await Contract.findById(contractId).populate("services");
    if (!contract) return res.status(404).json({ msg: "Contract not found" });

    if (contract.softCopy)
      return res.status(200).json({ msg: "Contract already created" });

    const servicesFreq = [];
    contract.services.map((item) =>
      servicesFreq.push({
        frequency: item.frequency,
        name: item.services.map((ser) => ser.label).join(", "),
      })
    );

    //create contract word file
    const template = fs.readFileSync("./tmp/contractTemp.docx");

    const buffer = await createReport({
      cmdDelimiter: ["{", "}"],
      template,

      additionalJsContext: {
        contractNo: contract.contractNo,
        type: contract.type === "NC" ? "New Contract" : "Renewal Contract",
        sales: contract.sales,
        startDate: moment(contract.tenure.startDate).format("DD/MM/YYYY"),
        endDate: moment(contract.tenure.endDate).format("DD/MM/YYYY"),
        billToName: contract.billToDetails.name,
        billToAddress: contract.billToDetails.address,
        billToCity: contract.billToDetails.city,
        billToPincode: contract.billToDetails.pincode,
        shipToAddress: contract.shipToDetails.address,
        shipToCity: contract.shipToDetails.city,
        shipToPincode: contract.shipToDetails.pincode,
        services: servicesFreq,
        contactName: contract.billToDetails.contact[0].name,
        contactNumber: contract.billToDetails.contact[0].number,
        date: moment().format("DD/MM/YYYY"),
        billingFrequency: contract.billingFrequency,
      },
    });

    const contractName = contract.contractNo.replace(/\//g, "-");
    const filePath = `./tmp/${contractName}.docx`;
    fs.writeFileSync(filePath, buffer);
    const link = await uploadFile({ filePath });
    if (!link)
      return res.status(400).json({ msg: "Upload error, try again later" });

    contract.softCopy = link;
    await contract.save();

    return res.status(201).json({ msg: "Digital contract created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const sendContract = async (req, res) => {
  const { id: contractId } = req.params;
  try {
    const contract = await Contract.findById(contractId).populate("services");
    if (!contract) return res.status(404).json({ msg: "Contract not found" });
    if (contract.softCopy && contract.sendMail)
      return res.status(200).json({ msg: "Contract already sent" });

    if (contract.softCopy && !contract.sendMail) {
      const allServices = [];
      for (let serviceCards of contract.services) {
        let serviceName = "";
        for (let service of serviceCards.services) {
          serviceName += `${service.label}, `;
        }
        allServices.push({
          name: serviceName,
          frequency: serviceCards.frequency.label || serviceCards.frequency,
          dates: serviceCards.serviceDates.join(", "),
        });
      }

      const tempEmails = new Set();
      contract.billToDetails.contact.map(
        (item) => item.email && tempEmails.add(item.email)
      );
      contract.shipToDetails.contact.map(
        (item) => item.email && tempEmails.add(item.email)
      );
      const emailList = [...tempEmails];

      const fileName = contract.contractNo.replace(/\//g, "-");
      const result = await axios.get(contract.softCopy, {
        responseType: "arraybuffer",
      });
      const base64File = Buffer.from(result.data, "binary").toString("base64");

      const attachObj = [
        {
          content: base64File,
          filename: `${fileName}.docx`,
          type: `application/docx`,
          disposition: "attachment",
        },
      ];

      const dynamicData = {
        contractNo: contract.contractNo,
        start: moment(contract.tenure.startDate).format("DD/MM/YYYY"),
        end: moment(contract.tenure.endDate).format("DD/MM/YYYY"),
        service: allServices,
      };

      const mailSent = await sendEmail({
        emailList,
        attachObj,
        templateId: "d-ebf14fa28bf5478ea134f97af409b1b7",
        dynamicData,
      });

      if (!mailSent)
        return res.status(400).json({ msg: "Email not sent, try again later" });

      contract.sendMail = true;
      await contract.save();
    }

    return res.json({ msg: "Contract Sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getSingleCard = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: "contract",
      select: "contractNo",
    });
    if (!service)
      return res
        .status(404)
        .json({ msg: "Service card not found, contact Admin" });

    const serviceCard = {
      contractNo: service.contract.contractNo,
      contractId: service.contract._id,
      name: service.services.map((ser) => ser.label),
    };

    return res.json(serviceCard);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
