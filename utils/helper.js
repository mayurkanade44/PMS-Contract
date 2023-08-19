import jwt from "jsonwebtoken";
import moment from "moment";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import sgMail from "@sendgrid/mail";

export const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const capitalLetter = (phrase) => {
  return phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const serviceDue = ({ frequency, serviceStart, diffDays }) => {
  const serviceDates = [];
  const serviceMonths = [];
  let frequencyDays;

  if (frequency === "Single") frequencyDays = 365;
  else if (frequency === "Weekly") frequencyDays = 7;
  else if (frequency === "2 Times In A Month") frequencyDays = 15;
  else if (frequency === "Monthly") frequencyDays = 30;
  else if (frequency === "Quarterly") frequencyDays = 90;

  const end = Math.floor(diffDays / frequencyDays);

  for (let i = 0; i < end; i++) {
    serviceDates.push(moment(serviceStart).format("DD/MM/YYYY"));

    if (!serviceMonths.includes(moment(serviceStart).format("MMM YY"))) {
      serviceMonths.push(moment(serviceStart).format("MMM YY"));
    }

    serviceStart = new Date(
      serviceStart.getFullYear(),
      serviceStart.getMonth(),
      serviceStart.getDate() + frequencyDays
    );
  }

  return { serviceMonths, serviceDates };
};

export const uploadFile = async ({ filePath }) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      use_filename: true,
      folder: "PMS",
      quality: 50,
      resource_type: "auto",
    });

    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    console.log("Cloud Upload", error);
    return false;
  }
};

export const sendEmail = async ({
  attachObj,
  dynamicData,
  emailList,
  templateId,
}) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: emailList,
      from: { email: "noreply.pestbytes@gmail.com", name: "PMS" },
      dynamic_template_data: dynamicData,
      template_id: templateId,
      attachments: attachObj,
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.log("Email error", error);
    return false;
  }
};
