import Billing from "../models/billingModel.js";
import Invoice from "../models/invoiceModel.js";
import Admin from "../models/adminModel.js";
import Contract from "../models/contractModel.js";
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
  req.body.month = moment(req.body.month).format("MMM YY");

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

    if (invoice.paymentStatus === "Received") {
      await Contract.updateOne(
        { contractNo: bill.contractDetails.number },
        { $set: { active: true } }
      ).session(session);
    }

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
    const invoice = await Invoice.findById(id).populate({
      path: "bill",
      select: "contractDetails",
    });
    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }

    if (invoice.type !== req.body.type) {
      return res.status(400).json({ msg: "Invoce type can not be changed" });
    }

    req.body.month = moment(req.body.month).format("MMM YY");

    await Invoice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.body.paymentStatus === "Received") {
      console.log(invoice.paymentStatus);

      await Contract.updateOne(
        { contractNo: invoice.bill.contractDetails.number },
        { $set: { active: true } }
      );
    }

    return res.status(200).json({ msg: "Invoice details updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

// export const getAllInvoices = async (req, res) => {
//   const {
//     search,
//     page,
//     paymentStatus,
//     billType,
//     paymentMode,
//     month,
//     isCancelled,
//     sales,
//   } = req.query;

//   //filtering
//   let query = {};
//   let sort = "-createdAt";
//   if (search) {
//     query = {
//       $or: [
//         { billNo: { $regex: search, $options: "i" } },
//         { number: { $regex: search, $options: "i" } },
//         { "bill.billToDetails.name": { $regex: search, $options: "i" } },
//       ],
//     };
//   }
//   if (billType && billType != "all") {
//     if (billType === "PMS") {
//       query.type = billType;
//       query.tax = false;
//     } else if (billType === "PMS Tax") {
//       query.type = billType;
//       query.tax = true;
//     } else {
//       query.type = billType;
//       query.tax = false;
//     }
//   }
//   if (paymentStatus && paymentStatus != "all") {
//     query.paymentStatus = paymentStatus;
//   }
//   if (paymentMode && paymentMode != "all") {
//     query.paymentMode = paymentMode;
//   }
//   if (month && month != "all") {
//     query.month = moment(month).format("MMM YY");
//   }

//   if (isCancelled && isCancelled != "all") {
//     query["cancelled.status"] = isCancelled;
//   }

//   let pageNumber = Number(page) || 1;
//   try {
//     let count = await Invoice.countDocuments({ ...query });

//     let invoiceQuery = Invoice.find(query);

//     if (sales && sales !== "all") {
//       invoiceQuery = invoiceQuery.populate({
//         path: "bill",
//         match: {
//           "contractDetails.sales": { $regex: sales, $options: "i" },
//         },
//         select:
//           "invoiceAmount.total invoiceAmount.basic contractDetails.sales billToDetails.name gstNo",
//       });
//     } else {
//       invoiceQuery = invoiceQuery.populate({
//         path: "bill",
//         select:
//           "invoiceAmount.total invoiceAmount.basic contractDetails.sales billToDetails.name gstNo",
//       });
//     }

//     // Execute query with pagination
//     const invoices = await invoiceQuery
//       .sort(sort)
//       .skip(10 * (pageNumber - 1))
//       .limit(10);

//     const filterInvoices = invoices.filter((invoice) => {
//       return invoice.bill !== null;
//     });

//     return res.status(200).json({
//       invoices: filterInvoices,
//       pages: Math.min(10, Math.ceil(count / 10)),
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ msg: "Server error, try again later" });
//   }
// };

export const getAllInvoices = async (req, res) => {
  const {
    search,
    page = 1,
    paymentStatus,
    billType,
    paymentMode,
    month,
    isCancelled,
    sales,
  } = req.query;

  try {
    const pageNumber = Number(page);
    const limit = 10;
    const skip = (pageNumber - 1) * limit;

    // Build the aggregation pipeline
    const pipeline = [];

    // Lookup to join with billing collection
    pipeline.push({
      $lookup: {
        from: "billings", // The collection name is usually plural and lowercase
        localField: "bill",
        foreignField: "_id",
        as: "billDetails",
      },
    });

    // Unwind the billDetails array
    pipeline.push({
      $unwind: "$billDetails",
    });

    // Match stage for filtering
    const matchStage = {};

    if (search) {
      matchStage.$or = [
        { billNo: { $regex: search, $options: "i" } },
        { number: { $regex: search, $options: "i" } },
        { "billDetails.billToDetails.name": { $regex: search, $options: "i" } },
      ];
    }

    if (billType && billType !== "all") {
      if (billType === "PMS") {
        matchStage.type = billType;
        matchStage.tax = false;
      } else if (billType === "PMS Tax") {
        matchStage.type = billType;
        matchStage.tax = true;
      } else {
        matchStage.type = billType;
        matchStage.tax = false;
      }
    }

    if (paymentStatus && paymentStatus !== "all") {
      matchStage.paymentStatus = paymentStatus;
    }

    if (paymentMode && paymentMode !== "all") {
      matchStage.paymentMode = paymentMode;
    }

    if (month && month !== "all") {
      matchStage.month = moment(month).format("MMM YY");
    }

    if (isCancelled && isCancelled !== "all") {
      matchStage["cancelled.status"] = isCancelled === "true";
    }

    if (sales && sales !== "all") {
      matchStage["billDetails.contractDetails.sales"] = {
        $regex: sales,
        $options: "i",
      };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add count stage for total documents
    const countPipeline = [...pipeline, { $count: "total" }];

    // Add sorting, skip and limit to main pipeline
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          number: 1,
          type: 1,
          tax: 1,
          billNo: 1,
          paymentStatus: 1,
          paymentMode: 1,
          paymentDate: 1,
          url: 1,
          month: 1,
          cancelled: 1,
          createdAt: 1,
          bill: {
            _id: "$billDetails._id",
            invoiceAmount: "$billDetails.invoiceAmount",
            contractDetails: "$billDetails.contractDetails",
            billToDetails: "$billDetails.billToDetails",
            gstNo: "$billDetails.gstNo",
          },
        },
      }
    );

    // Execute both pipelines in parallel
    const [invoices, countResult] = await Promise.all([
      Invoice.aggregate(pipeline),
      Invoice.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    return res.status(200).json({
      invoices,
      pages: Math.min(10, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const searchBill = async (req, res) => {
  const { search } = req.query;
  try {
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
    const { month } = req.query;
    const currentMonthString = month;

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

export const convertToTaxInvoice = async (req, res) => {
  const { id } = req.params;
  let session = null;
  try {
    // start session
    session = await mongoose.startSession();
    session.startTransaction();

    // Find invoice with session to ensure consistency
    const invoice = await Invoice.findById(id).session(session);
    if (!invoice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Billing details not found" });
    }

    if (invoice.type !== "PMS") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        msg: "Only PMS performa can be converted to tax invoices",
      });
    }

    const bill = await Billing.findById(invoice.bill._id).session(session);
    if (!bill) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Billing details not found" });
    }

    if (!bill.gstNo && !req.body.gstNo) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ msg: "GST number is required for tax invoice" });
    } else if (!invoice.bill.gstNo && req.body.gstNo) {
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

    let type = "TAX";
    let number = "";
    let taxCount = admin.taxCounter + 1;
    number = `PMST${taxCount}`;
    admin.taxCounter = taxCount;

    // else {
    //   const invoiceType = req.body.type;
    //   if (invoiceType === "MK") {
    //     const mkCount = admin.mkCounter + 1;
    //     number = `${invoiceType}P${mkCount}`;
    //     admin.mkCounter = mkCount;
    //   } else {
    //     const proformaCount = admin.proformaCounter + 1;
    //     number = `${invoiceType}P${proformaCount}`;
    //     admin.proformaCounter = proformaCount;
    //   }
    // }

    // Save admin counters
    await admin.save({ session });

    // save invoice with session
    req.body.number = number;
    req.body.type = "PMS Tax";
    req.body.tax = true;
    req.body.month = moment(req.body.month).format("MMM YY");

    const updatedInvoice = await Invoice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).session(session);

    if (invoice.paymentStatus === "Received") {
      await Contract.updateOne(
        { contractNo: bill.contractDetails.number },
        { $set: { active: true } }
      ).session(session);
    }

    // Commit the database transaction before doing file operations
    await session.commitTransaction();
    session.endSession();
    session = null; // Mark session as completed

    // Generate document
    try {
      const buffer = await createInvoiceDoc({
        bill,
        invoice: updatedInvoice,
        type,
      });

      const filename = `${updatedInvoice.number} ${bill.billToDetails.name} ${type} Invoice`;
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
        msg: "Tax Invoice generated",
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
