import Contract from "../models/contractModel.js";
import Service from "../models/serviceModel.js";
import moment from "moment";
import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

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
      services: req.body.services,
    });

    const serviceName = service.services.map((item) => item.label + ",");

    const buf = await qrCodeGenerator(
      `https://pestxz.com/service-card/${service._id}`,
      contract.contractNo,
      serviceName
    );
    if (!buf) return res.status(400).json({ msg: "QR error, trg again later" });

    fs.writeFileSync("./tmp/image.jpeg", buf);

    const result = await cloudinary.uploader.upload("tmp/image.jpeg", {
      use_filename: true,
      folder: "PMS",
    });

    service.qr = result.secure_url;
    await service.save();

    fs.unlinkSync("./tmp/image.jpeg");

    return res.json({ msg: "Service card added" });
  } catch (error) {
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
    ctx.fillText(`Service Name: ${serviceName}`, 2, height + 53);
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
