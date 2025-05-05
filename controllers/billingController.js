import Billing from "../models/billingModel.js";
import Invoice from "../models/invoiceModel.js";
import Admin from "../models/adminModel.js";
import fs from "fs";
import mongoose from "mongoose";
import {
  billingFrequency,
  calculateGSTAmount,
  capitalLetter,
  createInvoiceDoc,
  uploadFile,
} from "../utils/helper.js";
import moment from "moment";

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
    console.log(newBill);

    return res.status(201).json({ bill: newBill, msg: "Bill details added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const createInvoice = async (req, res) => {
  const { id } = req.params;
  let session = null;
  req.body.createdBy = req.user.name;
  console.log(req.body);

  try {
    // Start session
    session = await mongoose.startSession();
    session.startTransaction();

    // Find bill with session to ensure consistency
    const bill = await Billing.findById(id).session(session);
    if (!bill) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Billing details not found" });
    }

    // Update GST number if provided
    if (!bill.gstNo && req.body.gstNo) {
      bill.gstNo = req.body.gstNo;
      await bill.save({ session });
    }

    // Get admin with session
    const adminId = "64fef7fee25b8a61d21a381e";
    const admin = await Admin.findById(adminId).session(session);
    if (!admin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ msg: "Admin configuration not found" });
    }

    let type = "PROFORMA";
    let number = "";
    let maxAttempts = 5;
    let isUnique = false;

    if (req.body.tax) {
      type = "TAX";
      const taxCount = admin.taxCounter + 1;
      number = `PMST${taxCount}`;
      admin.taxCounter = taxCount;
    } else {
      const invoiceType = req.body.type;
      if (invoiceType === "MK") {
        const mkCount = admin.mkCounter + 1;
        number = `${invoiceType}P${mkCount}`;
        admin.mkCounter = mkCount;
      } else {
        const proformaCount = admin.proformaCounter + 1;
        number = `${invoiceType}P${proformaCount}`;
        admin.proformaCounter = proformaCount;
      }
    }

    // Save admin counters
    await admin.save({ session });

    // Create invoice with session
    req.body.number = number;
    const invoice = await Invoice.create([req.body], { session }).then(
      (docs) => docs[0]
    );

    // Commit the database transaction before doing file operations
    await session.commitTransaction();
    session.endSession();
    session = null; // Mark session as completed

    // Generate document
    try {
      const buffer = await createInvoiceDoc({
        bill,
        invoice,
        type,
      });

      const filename = `${invoice.number} ${bill.billToDetails.name} ${type} Invoice`;
      const filePath = `./tmp/${filename}.docx`;

      // Ensure the tmp directory exists
      if (!fs.existsSync("./tmp")) {
        fs.mkdirSync("./tmp", { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);

      // Upload file (outside of transaction)
      const invoiceUrl = await uploadFile({ filePath, folder: "invoices" });
      if (!invoiceUrl) {
        await Invoice.findByIdAndUpdate(invoice._id, { status: "error" });
        return res.status(400).json({ msg: "Upload error, try again later" });
      }

      // Update invoice with URL (outside transaction)
      await Invoice.findByIdAndUpdate(invoice._id, { url: invoiceUrl });

      return res.status(201).json({
        url: invoiceUrl,
        name: filename,
        msg: "Invoice generated",
      });
    } catch (fileError) {
      console.error("File system or upload error:", fileError);

      // The transaction is already committed, so we need to update the invoice
      await Invoice.findByIdAndUpdate(invoice._id, { status: "error" });

      return res
        .status(500)
        .json({ msg: "Error generating or uploading invoice document" });
    }
  } catch (error) {
    console.error("Create invoice error:", error);

    // Only abort transaction if session exists and is active
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (sessionError) {
        console.error("Session cleanup error:", sessionError);
      }
    }

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
    console.log(req.body);

    req.body.number = `${bill.contractDetails.number} P/${calculatedAmount.duration}`;

    const updatedBill = await Billing.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res
      .status(200)
      .json({ bill: updatedBill, msg: "Billing details updated" });
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

    if (invoice.type !== req.body.type) {
      return res.status(400).json({ msg: "Invoce type can not be changed" });
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
  const {
    search,
    page,
    paymentStatus,
    billType,
    paymentMode,
    month,
    isCancelled,
  } = req.query;

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
  if (billType && billType != "all") {
    if (billType === "PMS") {
      query.type = billType;
      query.tax = false;
    } else if (billType === "PMS Tax") {
      query.type = billType;
      query.tax = true;
    } else {
      query.type = billType;
      query.tax = false;
    }
  }
  if (paymentStatus && paymentStatus != "all") {
    query.paymentStatus = paymentStatus;
  }
  if (paymentMode && paymentMode != "all") {
    query.paymentMode = paymentMode;
  }
  if (month && month != "all") {
    console.log(moment(month).format("MMM YY"));

    query.month = moment(month).format("MMM YY");
  }

  if (isCancelled && isCancelled != "all") {
    query.cancelled.status = isCancelled;
  }

  let pageNumber = Number(page) || 1;
  try {
    const count = await Invoice.countDocuments({ ...query });

    const invoices = await Invoice.find(query)
      .populate({
        path: "bill",
        select:
          "invoiceAmount.total contractDetails.sales billToDetails.name gstNo",
      })
      .sort(sort)
      .skip(10 * (pageNumber - 1))
      .limit(10);

    const filterInvoices = invoices.filter((invoice) => {
      return invoice.bill !== null;
    });

    return res.status(200).json({
      invoices: filterInvoices,
      pages: Math.min(10, Math.ceil(count / 10)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const searchBill = async (req, res) => {
  const { search } = req.query;
  try {
    console.log(search);
    if (!search)
      return res
        .status(400)
        .json({ msg: "Please provide bill reference number" });

    const bill = await Billing.findOne({
      number: { $regex: search, $options: "i" },
    });
    if (!bill) return res.status(404).json({ msg: "bill details not found" });
    return res.status(200).json(bill);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const cancelInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(req.body);
    if (!req.body.reason) {
      return res.status(400).json({ msg: "Please provide a reason" });
    }
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }
    invoice.cancelled = {
      status: true,
      reason: req.body.reason,
      by: req.user.name,
      at: new Date(),
    };
    await invoice.save();
    return res.status(200).json({ msg: "Invoice cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const getMonthlyInvoiceStats = async (req, res) => {
  try {
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonthString = `${monthNames[now.getMonth()]} ${now
      .getFullYear()
      .toString()
      .slice(-2)}`;

    console.log(currentMonthString);

    const toGenerateCount = await Billing.countDocuments({
      billingMonths: currentMonthString,
    });

    const pendingCount = await Invoice.countDocuments({
      month: currentMonthString,
      paymentStatus: "Pending",
      "cancelled.status": false,
    });

    const receivedCount = await Invoice.countDocuments({
      month: currentMonthString,
      paymentStatus: "Received",
      "cancelled.status": false,
    });

    const cancelledCount = await Invoice.countDocuments({
      month: currentMonthString,
      "cancelled.status": true,
    });

    const st = await Invoice.find({
      month: currentMonthString,
      paymentStatus: "Received",
      "cancelled.status": false,
    });
    console.log(st.length);

    return res.status(200).json({
      currentMonth: currentMonthString,
      toGenerate: toGenerateCount,
      pending: pendingCount,
      received: receivedCount,
      cancelled: cancelledCount,
    });
  } catch (error) {
    console.error("Error fetching monthly invoice stats:", error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};
