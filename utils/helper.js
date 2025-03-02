import jwt from "jsonwebtoken";
import moment from "moment";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import SibApiV3Sdk from "@getbrevo/brevo";
import { createReport } from "docx-templates";

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

  let diffDays = moment(contract.endDate).diff(
    moment(contract.startDate),
    "days"
  );
  if (moment(contract.startDate).month() === 1) {
    diffDays += 2;
  }
  const endDate = contract.endDate;

  if (frequency === "2 Times In A Week" || frequency === "Weekly") {
    frequencyDays = 7;
    end = Math.floor(diffDays / frequencyDays);
  } else if (frequency === "2 Times In A Month") {
    frequencyDays = 15;
    end = Math.floor(diffDays / frequencyDays);
  } else if (frequency === "3 Times In A Month") {
    frequencyDays = 10;
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
    if (attachment) sendSmtpEmail.attachment = attachment;
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const createServiceCard = async ({
  contract,
  contractPeriod,
  cardQrCode,
  service,
}) => {
  try {
    const template = fs.readFileSync("./tmp/cardTemp.docx");

    const buffer = await createReport({
      cmdDelimiter: ["{", "}"],
      template,

      additionalJsContext: {
        contractNo: contract.contractNo,
        sales: contract.sales,
        name: contract.shipToDetails.name,
        address: contract.shipToDetails.address,
        city: contract.shipToDetails.city,
        nearBy: contract.shipToDetails.nearBy,
        shipArea: contract.shipToDetails.area,
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
        instruction: service.instruction,
        url: "12",
        qrCode: async (url12) => {
          const dataUrl = cardQrCode;
          const data = await dataUrl.slice("data:image/png;base64,".length);
          return { width: 2.5, height: 2.5, data, extension: ".png" };
        },
      },
    });

    return buffer;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const calculateGSTAmount = (amount, frequency, months) => {
  //calculate contract amount
  let basic = Number(amount);
  let gst = Number(((basic * 18) / 100).toFixed(2));
  let sgst = Number((gst / 2).toFixed(2));
  let cgst = Number((gst / 2).toFixed(2));
  let total = basic + gst;
  let contractAmount = { basic, cgst, sgst, gst, total };

  //calculate invoice amount
  let duration = 1;
  if (
    (frequency == "quarterly" && months < 3) ||
    (frequency == "6months" && months < 6)
  )
    return { errorMsg: "Please select valid payment terms" };

  if (frequency == "monthly") duration = months;
  else if (frequency == "quarterly") duration = months / 3;
  else if (frequency == "6months") duration = months / 6;
  basic = Number((Number(basic) / duration).toFixed(2));
  gst = Number(((basic * 18) / 100).toFixed(2));
  sgst = Number((gst / 2).toFixed(2));
  cgst = sgst;
  total = basic + gst;
  let invoiceAmount = { basic, cgst, sgst, gst, total };

  return { contractAmount, invoiceAmount, duration };
};

export const calculateInvoiceAmount = (serviceDetails, frequency, months) => {
  const invoiceServiceDetails = JSON.parse(JSON.stringify(serviceDetails));

  console.log(frequency, months);

  if (frequency == "monthly") duration = months;
  else if (frequency == "quarterly") duration = months / 3;
  else if (frequency == "6months") duration = months / 6;

  invoiceServiceDetails.map(
    (item) =>
      (item.amount = Number((Number(item.amount) / duration).toFixed(2)))
  );

  let basic = invoiceServiceDetails.reduce(
    (sum, service) => sum + Number(service.amount),
    0
  );
  basic = Number(basic.toFixed(2));
  let gst = Number(((basic * 18) / 100).toFixed(2));
  let sgst = Number((gst / 2).toFixed(2));
  let cgst = Number((gst / 2).toFixed(2));
  let total = basic + gst;

  let invoiceAmount = { basic, cgst, sgst, gst, total };

  return { invoiceAmount, invoiceServiceDetails, duration };
};

export const billingFrequency = (frequency, tenure) => {
  let totalMonths = tenure.months;

  let month = tenure.startDate;
  const billingMonths = [moment(tenure.startDate).format("MMM YY")];
  let frequencyMonths = 1;
  if (frequency == "monthly") {
    frequencyMonths = totalMonths;
    while (frequencyMonths > 1) {
      month = moment(month).add(1, "months");
      billingMonths.push(moment(month).format("MMM YY"));
      frequencyMonths--;
    }
  } else if (frequency == "quarterly") {
    frequencyMonths = totalMonths / 3;
    while (frequencyMonths > 1) {
      month = moment(month).add(3, "months");
      billingMonths.push(moment(month).format("MMM YY"));
      frequencyMonths--;
    }
  } else if (frequency == "6months") {
    frequencyMonths = totalMonths / 6;
    while (frequencyMonths > 1) {
      month = moment(month).add(6, "months");
      billingMonths.push(moment(month).format("MMM YY"));
      frequencyMonths--;
    }
  }

  return billingMonths;
};

export const createInvoiceDoc = async ({ bill, invoice, type }) => {
  try {
    const template = fs.readFileSync("./tmp/invoiceTemp.docx");

    const buffer = await createReport({
      cmdDelimiter: ["{", "}"],
      template,

      additionalJsContext: {
        type: type,
        date: moment().format("DD/MM/YYYY"),
        number: invoice.number,
        refNumber: bill.number,
        gstNo: bill.gstNo,
        billTo: bill.billToDetails,
        shipTo: bill.shipToDetails,
        services: bill.serviceDetails,
        basic: formatToINR(bill.invoiceAmount.basic),
        gst: formatToINR(bill.invoiceAmount.cgst),
        gstTotal: formatToINR(bill.invoiceAmount.gst),
        total: formatToINR(bill.invoiceAmount.total),
        amountWords: numberToWords(bill.invoiceAmount.total),
      },
    });

    return buffer;
  } catch (error) {
    console.log(error);
    return false;
  }
};

function formatToINR(number) {
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function numberToWords(num) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const units = ["", "Thousand", "Lakh", "Crore"];

  if (num === 0) return "Zero Rupees";

  function getWords(n) {
    let str = "";
    if (n > 19) {
      str += tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    } else {
      str += ones[n];
    }
    return str;
  }

  let result = "";
  let i = 0;

  // Split number into groups following Indian system (3,2,2,...)
  const parts = [];
  parts.push(num % 1000); // First 3 digits
  num = Math.floor(num / 1000);

  while (num > 0) {
    parts.push(num % 100);
    num = Math.floor(num / 100);
  }

  // Convert parts into words
  for (let j = parts.length - 1; j >= 0; j--) {
    if (parts[j] !== 0) {
      if (j === 0 && parts[j] > 99) {
        result += ones[Math.floor(parts[j] / 100)] + " Hundred ";
        result += getWords(parts[j] % 100);
      } else {
        result += getWords(parts[j]) + (units[j] ? " " + units[j] + " " : "");
      }
    }
  }

  return result.trim() + " Rupees Only";
}
