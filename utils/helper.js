import jwt from "jsonwebtoken";
import moment from "moment";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import sgMail from "@sendgrid/mail";
import SibApiV3Sdk from "@getbrevo/brevo";

export const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const capitalLetter = (phrase) => {
  return phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const serviceDates = ({ frequency, serviceStartDate, contract }) => {
  const serviceDates = [];
  const months = new Set();
  let serviceDate = serviceStartDate.first;
  let frequencyDays = 365,
    add = "Days",
    end = 1;

  const diffDays = moment(contract.endDate).diff(
    moment(contract.startDate),
    "days"
  );
  const endDate = contract.endDate;

  if (frequency === "2 Times In A Week" || frequency === "Weekly") {
    frequencyDays = 7;
    end = Math.floor(diffDays / frequencyDays);
  } else if (frequency === "2 Times In A Month") {
    frequencyDays = 15;
    end = Math.floor(diffDays / frequencyDays);
  } else if (frequency === "Monthly") {
    frequencyDays = 1;
    add = "Months";
    end = Math.floor(diffDays / 30);
  } else if (frequency === "Quarterly") {
    frequencyDays = 3;
    add = "Months";
    end = Math.floor(diffDays / 90);
  }

  if (frequency === "2 Times In A Week") {
    const first = Math.abs(
      moment(serviceDate).diff(moment(serviceStartDate.second), "days")
    );
    const nextDay = moment(serviceDate).add(7, "days");
    const second = Math.abs(
      moment(serviceStartDate.second).diff(nextDay, "days")
    );

    end = end * 2;
    while (moment(serviceDate).isBefore(moment(endDate)) && end > 0) {
      serviceDates.push(moment(serviceDate).format("DD/MM/YYYY"));
      months.add(moment(serviceDate).format("MMM YY"));

      serviceDate = moment(serviceDate).add(first, "days");
      end -= 1;
      if (moment(serviceDate).isAfter(endDate) || end === 0) break;

      serviceDates.push(moment(serviceDate).format("DD/MM/YYYY"));
      serviceDate = moment(serviceDate).add(second, "days");
      end -= 1;
      if (moment(serviceDate).isAfter(endDate) || end === 0) break;
    }
  } else {
    while (moment(serviceDate).isBefore(moment(endDate)) && end > 0) {
      if (moment(serviceDate).format("dddd") === "Sunday") {
        serviceDates.push(
          moment(serviceDate).add(1, "Day").format("DD/MM/YYYY")
        );
      } else {
        serviceDates.push(moment(serviceDate).format("DD/MM/YYYY"));
      }

      months.add(moment(serviceDate).format("MMM YY"));
      serviceDate = moment(serviceDate).add(frequencyDays, add);
      end -= 1;
    }
  }

  const serviceMonths = [...months];

  return { serviceMonths, serviceDates };
};

export const uploadFile = async ({ filePath, folder }) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      use_filename: true,
      folder,
      quality: 40,
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

export const sendBrevoEmail = async ({
  attachment,
  dynamicData,
  emailList,
  templateId,
}) => {
  try {
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "PMS",
      email: process.env.NO_REPLY_EMAIL,
    };
    sendSmtpEmail.to = emailList;
    sendSmtpEmail.params = dynamicData;
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.attachment = attachment;
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
