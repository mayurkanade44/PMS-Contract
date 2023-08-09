export const contractEnd = [
  { value: 1, label: "1 Month" },
  { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months" },
  { value: 12, label: "1 Year" },
  { value: 36, label: "3 Years" },
  { value: 60, label: "5 Years" },
  { value: "Onwards", label: "Onwards" },
];

export const preferredTime = [
  { value: "10 am - 12 pm", label: "10 am - 12 pm" },
  { value: "12 am - 2 pm", label: "12 am - 2 pm" },
  { value: "2 pm - 4 pm", label: "2 pm - 4 pm" },
  { value: "4 pm - 6 pm", label: "4 pm - 6 pm" },
  { value: "Night", label: "Night" },
  { value: "Anytime", label: "Anytime" },
  { value: "To Confirm", label: "To Confirm" },
];

export const contractTypes = [
  { value: "NC", label: "New Contract" },
  { value: "RC", label: "Renew Contract" },
];

export const allFrequency = [
  {
    value: {
      name: "Single",
      days: 365,
    },
    label: "Single",
  },
  {
    value: {
      name: "Weekly",
      days: 7,
    },
    label: "Weekly",
  },
  {
    value: {
      name: "2 Times In A Month",
      days: 15,
    },
    label: "2 Times In A Month",
  },
  {
    value: {
      name: "Monthly",
      days: 30,
    },
    label: "Monthly",
  },
  {
    value: {
      name: "Quarterly",
      days: 90,
    },
    label: "Quarterly",
  },
];

export const allService = [
  { value: "Green Shield", label: "Green Shield" },
  { value: "Bedbugs", label: "Bedbugs" },
  { value: "Antron", label: "Antron" },
];
