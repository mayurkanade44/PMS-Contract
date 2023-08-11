import jwt from "jsonwebtoken";
import moment from "moment";

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

export const serviceDue = ({ frequency, serviceStart }) => {
  const serviceDates = [];
  const serviceMonths = [];
  let frequencyDays;

  if (frequency === "Single") frequencyDays = 365;
  else if (frequency === "Weekly") frequencyDays = 7;
  else if (frequency === "2 Times In A Month") frequencyDays = 15;
  else if (frequency === "Monthly") frequencyDays = 30;
  else if (frequency === "Quarterly") frequencyDays = 90;

  const end = Math.floor(365 / frequencyDays);

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
