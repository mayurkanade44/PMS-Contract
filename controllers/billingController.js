import Billing from "../models/billingModel.js";
import Invoice from "../models/invoiceModel.js";
import Admin from "../models/adminModel.js";
import {
  billingFrequency,
  calculateGSTAmount,
  calculateInvoiceAmount,
  capitalLetter,
  createInvoiceDoc,
  uploadFile,
} from "../utils/helper.js";
import fs from "fs";

export const addBilling = async (req, res) => {
  const {} = req.body;
  try {
    let bill = await Billing.findOne({
      "contractDetails.number": {
        $regex: req.body.contractDetails.number,
        $options: "i",
      },
    });
    if (bill) {
      return res
        .status(400)
        .json({ msg: "Billing details already added for this contract" });
    }
    req.body.billToDetails.name = capitalLetter(req.body.billToDetails.name);
    req.body.shipToDetails.name = capitalLetter(req.body.shipToDetails.name);

    const calculatedAmount = calculateGSTAmount(
      req.body.amount,
      req.body.paymentTerms,
      req.body.tenure.months
    );

    if (calculatedAmount.errorMsg)
      return res.status(400).json({ msg: calculatedAmount.errorMsg });

    req.body.billingMonths = billingFrequency(
      req.body.paymentTerms,
      req.body.tenure
    );

    req.body.serviceDetails.map((item) => (item.hsn = 998531));
    req.body.invoiceAmount = calculatedAmount.invoiceAmount;
    req.body.contractAmount = calculatedAmount.contractAmount;

    req.body.number = `${req.body.contractDetails.number} P/${calculatedAmount.duration}`;

    let newBill = await Billing.create(req.body);
    return res.status(201).json({ id: newBill._id, msg: "Bill details added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const createInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const bill = await Billing.findById(id);
    if (!bill) {
      return res.status(404).json({ msg: "Billing details not found" });
    }

    if (!bill.gstNo) {
      bill.gstNo = req.body.gstNo;
      await bill.save();
    }

    //calculate proforma/gst number
    const admin = await Admin.findById("64fef7fee25b8a61d21a381e");
    let type = "PROFORMA";
    let number = "1";
    if (req.body.tax) {
      let taxCount = admin.taxCounter + 1;
      number = "PMST" + taxCount;
      let taxInvoiceExists = await Invoice.findOne({ number });
      while (taxInvoiceExists) {
        taxCount += 1;
        number = "PMST" + taxCount;
        taxInvoiceExists = await Invoice.findOne({ number });
      }
      admin.taxCounter = taxCount;
      await admin.save();
      type = "TAX";
    } else {
      let proformaCount = admin.proformaCounter + 1;
      number = "PMSP" + proformaCount;
      let proformaInvoiceExists = await Invoice.findOne({ number });
      while (proformaInvoiceExists) {
        proformaCount += 1;
        number = "PMSP" + proformaCount;
        proformaInvoiceExists = await Invoice.findOne({ number });
      }
      admin.proformaCounter = proformaCount;
      await admin.save();
    }

    req.body.number = number;
    const invoice = await Invoice.create(req.body);

    const buffer = await createInvoiceDoc({
      bill,
      invoice,
      type,
    });
    const filename = `${invoice.number} ${bill.billToDetails.name} ${type} Invoice`;
    const filePath = `./tmp/${filename}.docx`;
    fs.writeFileSync(filePath, buffer);

    const invoiceUrl = await uploadFile({ filePath, folder: "invoices" });
    if (!invoiceUrl) {
      await Invoice.findByIdAndDelete(invoice._id);
      return res.status(400).json({ msg: "Upload error, trg again later" });
    }

    invoice.url = invoiceUrl;
    await invoice.save();

    return res
      .status(201)
      .json({ url: invoiceUrl, name: filename, msg: "Invoice generated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getBillDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const bill = await Billing.findById(id);
    if (!bill) {
      return res.status(404).json({ msg: "Billing details not found" });
    }

    return res.status(200).json(bill);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const updateBillDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const bill = await Billing.findById(id);
    if (!bill) {
      return res.status(404).json({ msg: "Billing details not found" });
    }

    req.body.billToDetails.name = capitalLetter(req.body.billToDetails.name);
    req.body.shipToDetails.name = capitalLetter(req.body.shipToDetails.name);

    const calculatedAmount = calculateGSTAmount(
      req.body.amount,
      req.body.paymentTerms,
      bill.tenure.months
    );

    if (calculatedAmount.errorMsg)
      return res.status(400).json({ msg: calculatedAmount.errorMsg });

    req.body.billingMonths = billingFrequency(
      req.body.paymentTerms,
      bill.tenure
    );

    req.body.serviceDetails.map((item) => (item.hsn = 998531));
    req.body.invoiceAmount = calculatedAmount.invoiceAmount;
    req.body.contractAmount = calculatedAmount.contractAmount;

    req.body.number = `${bill.contractDetails.number} P/${calculatedAmount.duration}`;

    await Billing.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ msg: "Billing details updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const updateInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }

    await Invoice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ msg: "Invoice details updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getAllInvoices = async (req, res) => {
  const { search, page, paymentStatus, billType } = req.query;
  console.log(billType);

  //filtering
  let query = {};
  let sort = "-createdAt";
  if (search) {
    query = {
      $or: [
        { billNo: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } },
        { "bill.billToDetails.name": { $regex: search, $options: "i" } },
      ],
    };
  }
  if (paymentStatus && paymentStatus != "all") {
    query.paymentStatus = paymentStatus;
  }
  if (billType && billType !== "all") {
    query["bill.type"] = billType;
  }

  let pageNumber = Number(page) || 1;
  try {
    const count = await Invoice.countDocuments({ ...query });

    const invoices = await Invoice.find(query)
      .populate({
        path: "bill",
        select: "invoiceAmount.total contractDetails.sales billToDetails.name",
      })
      .sort(sort)
      .skip(20 * (pageNumber - 1))
      .limit(20);

    return res
      .status(200)
      .json({ invoices, pages: Math.min(10, Math.ceil(count / 20)) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
