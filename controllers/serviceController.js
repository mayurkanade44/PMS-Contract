import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import moment from "moment";
import QRCode from "qrcode";
import fs from "fs";
import {
  createServiceCard,
  sendBrevoEmail,
  sendEmail,
  serviceDates,
  uploadFile,
} from "../utils/helper.js";
import { createReport } from "docx-templates";

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
      instruction: req.body.instruction,
    });

    cardId = service._id;
    const qrLink = `${process.env.WEBSITE}/report/${service._id}`;

    //service qr image creation
    // const serviceName = service.services.map((item) => item.label + ",");
    // const buf = await qrCodeGenerator(qrLink, contract.contractNo, serviceName);
    // if (!buf) {
    //   if (cardId) {
    //     await Service.findByIdAndDelete(cardId);
    //     cardId = null;
    //   }
    //   return res.status(400).json({ msg: "QR error, trg again later" });
    // }
    const qrFilePath = "./tmp/cardQR.png";
    await QRCode.toFile(qrFilePath, qrLink, { width: 1, margin: 2 });

    //upload qr image
    const qrUrl = await uploadFile({
      filePath: qrFilePath,
      folder: "contracts",
    });
    if (!qrUrl) {
      if (cardId) {
        await Service.findByIdAndDelete(cardId);
        cardId = null;
      }
      return res.status(400).json({ msg: "Upload error, trg again later" });
    }

    //service card creation
    const cardQrCode = await QRCode.toDataURL(qrLink);

    const buffer = await createServiceCard({
      contract,
      service,
      cardQrCode,
      contractPeriod,
    });
    const contractName = contract.contractNo.replace(/\//g, "-");
    const filename = `${contractName} ${service.frequency}`;
    const filePath = `./tmp/${filename}.docx`;
    fs.writeFileSync(filePath, buffer);
    const cardUrl = await uploadFile({ filePath, folder: "contracts" });
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

export const updateCard = async (req, res) => {
  const { id, frequency, serviceCardId, serviceStartDate, dates } = req.body;
  try {
    let serviceExist = await Service.findById(serviceCardId);
    if (!serviceExist)
      return res.status(404).json({ msg: "Service card not found" });

    const contract = await Contract.findById(id);
    if (!contract || !contract.active)
      return res.status(404).json({ msg: "Contract not found" });

    if (
      frequency !== serviceExist.frequency ||
      serviceStartDate.first !== serviceExist.serviceStartDate.first ||
      serviceStartDate.second !== serviceExist.serviceStartDate.second
    ) {
      const due = serviceDates({
        frequency,
        serviceStartDate,
        contract: contract.tenure,
      });
      req.body.serviceMonths = due.serviceMonths;
      req.body.serviceDates = due.serviceDates;
    } else {
      const months = new Set();
      for (let date of dates.split(", ")) {
        months.add(moment(date, "DD/MM/YYYY").format("MMM YY"));
      }
      req.body.serviceMonths = [...months];
    }
        
    const service = req.body;

    const cardQrCode = await QRCode.toDataURL(
      `${process.env.WEBSITE}/report/${serviceExist._id}`
    );
    const contractPeriod = `${moment(contract.tenure.startDate).format(
      "DD/MM/YYYY"
    )} To ${moment(contract.tenure.endDate).format("DD/MM/YYYY")}`;

    const buffer = await createServiceCard({
      contract,
      service,
      contractPeriod,
      cardQrCode,
    });

    const contractName = contract.contractNo.replace(/\//g, "-");
    const filename = `${contractName} ${service.frequency}`;
    const filePath = `./tmp/${filename}.docx`;
    fs.writeFileSync(filePath, buffer);
    const cardUrl = await uploadFile({ filePath, folder: "contracts" });
    if (!cardUrl) {
      return res.status(400).json({ msg: "Upload error, trg again later" });
    }

    req.body.card = cardUrl;
    await Service.findByIdAndUpdate(serviceCardId, service, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ msg: "Service card updated" });
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
        area: item.area,
        location: item.treatmentLocation,
      })
    );

    //create contract word file
    const template = fs.readFileSync("./tmp/contractTemp.docx");

    const buffer = await createReport({
      cmdDelimiter: ["{", "}"],
      template,

      additionalJsContext: {
        contractNo: contract.contractNo,
        cost: contract.cost,
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
        contactEmail: contract.billToDetails.contact[0].email,
        date: moment().format("DD/MM/YYYY"),
        billingFrequency: contract.billingFrequency,
      },
    });

    const contractName = contract.contractNo.replace(/\//g, "-");
    const filePath = `./tmp/${contractName}.docx`;
    fs.writeFileSync(filePath, buffer);
    const link = await uploadFile({ filePath, folder: "contracts" });
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
          frequency: serviceCards.frequency,
          months: serviceCards.serviceMonths.join(", "),
        });
      }

      const emailList = [];
      contract.billToDetails.contact.map(
        (item) =>
          item.email &&
          !emailList.some((i) => i.email === item.email) &&
          emailList.push({ email: item.email })
      );
      contract.shipToDetails.contact.map(
        (item) =>
          item.email &&
          !emailList.some((i) => i.email === item.email) &&
          emailList.push({ email: item.email })
      );

      const fileName = contract.contractNo.replace(/\//g, "-");
      // const result = await axios.get(contract.softCopy, {
      //   responseType: "arraybuffer",
      // });
      // const base64File = Buffer.from(result.data, "binary").toString("base64");

      // const attachObj = [
      //   {
      //     content: base64File,
      //     filename: `${fileName}.docx`,
      //     type: `application/docx`,
      //     disposition: "attachment",
      //   },
      // ];

      const dynamicData = {
        name: contract.billToDetails.name,
        contractNo: contract.contractNo,
        start: moment(contract.tenure.startDate).format("DD/MM/YYYY"),
        end: moment(contract.tenure.endDate).format("DD/MM/YYYY"),
        service: allServices,
      };
      let templateId = 2;
      if (contract.type === "RC") templateId = 3;

      // const mailSent = await sendEmail({
      //   emailList,
      //   attachObj,
      //   templateId: tempId,
      //   dynamicData,
      // });

      const mailSent = await sendBrevoEmail({
        emailList,
        dynamicData,
        attachment: [{ url: contract.softCopy, name: `${fileName}.docx` }],
        templateId,
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
