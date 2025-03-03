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
    return res.status(201).json({ bill: newBill, msg: "Bill details added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error, try again later" });
  }
};

// export const createInvoice = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const bill = await Billing.findById(id);
//     if (!bill) {
//       return res.status(404).json({ msg: "Billing details not found" });
//     }

//     if (!bill.gstNo) {
//       bill.gstNo = req.body.gstNo;
//       await bill.save();
//     }

//     //calculate proforma/gst number
//     const admin = await Admin.findById("64fef7fee25b8a61d21a381e");
//     let type = "PROFORMA";
//     let number = "1";
//     if (req.body.tax) {
//       let taxCount = admin.taxCounter + 1;
//       number = "PMST" + taxCount;
//       let taxInvoiceExists = await Invoice.findOne({ number });
//       while (taxInvoiceExists) {
//         taxCount += 1;
//         number = "PMST" + taxCount;
//         taxInvoiceExists = await Invoice.findOne({ number });
//       }
//       admin.taxCounter = taxCount;
//       await admin.save();
//       type = "TAX";
//     } else {
//       let proformaCount;
//       let invoiceType = bill.type;
//       if (invoiceType == "MK") {
//         proformaCount = admin.mkCounter + 1;
//         number = invoiceType + "P" + proformaCount;
//       } else {
//         proformaCount = admin.proformaCounter + 1;
//         number = invoiceType + "P" + proformaCount;
//       }
//       let proformaInvoiceExists = await Invoice.findOne({ number });
//       while (proformaInvoiceExists) {
//         proformaCount += 1;
//         number = invoiceType  + "P" + proformaCount;
//         proformaInvoiceExists = await Invoice.findOne({ number });
//       }
//       admin.proformaCounter = proformaCount;
//       await admin.save();
//     }

//     req.body.number = number;
//     const invoice = await Invoice.create(req.body);

//     const buffer = await createInvoiceDoc({
//       bill,
//       invoice,
//       type,
//     });
//     const filename = `${invoice.number} ${bill.billToDetails.name} ${type} Invoice`;
//     const filePath = `./tmp/${filename}.docx`;
//     fs.writeFileSync(filePath, buffer);

//     const invoiceUrl = await uploadFile({ filePath, folder: "invoices" });
//     if (!invoiceUrl) {
//       await Invoice.findByIdAndDelete(invoice._id);
//       return res.status(400).json({ msg: "Upload error, trg again later" });
//     }

//     invoice.url = invoiceUrl;
//     await invoice.save();

//     return res
//       .status(201)
//       .json({ url: invoiceUrl, name: filename, msg: "Invoice generated" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ msg: "Server error, try again later" });
//   }
// };

export const createInvoice = async (req, res) => {
  const { id } = req.params;
  let session = null;

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

    // Try to generate a unique number with retries
    // while (!isUnique && maxAttempts > 0) {
    //   if (req.body.tax) {
    //     // Generate tax invoice number
    //     const taxCount = admin.taxCounter + 1;
    //     number = `PMST${taxCount}`;
    //     admin.taxCounter = taxCount;
    //     type = "TAX";
    //   } else {
    //     // Generate proforma invoice number
    //     const invoiceType = bill.type;
    //     if (invoiceType === "MK") {
    //       const mkCount = admin.mkCounter + 1;
    //       number = `${invoiceType}P${mkCount}`;
    //       admin.mkCounter = mkCount;
    //     } else {
    //       const proformaCount = admin.proformaCounter + 1;
    //       number = `${invoiceType}P${proformaCount}`;
    //       admin.proformaCounter = proformaCount;
    //     }
    //   }

    //   // Check for uniqueness with the session
    //   const existingInvoice = await Invoice.findOne({ number }).session(
    //     session
    //   );
    //   if (!existingInvoice) {
    //     isUnique = true;
    //   } else {
    //     maxAttempts--;
    //   }
    // }

    // // If we couldn't generate a unique number after max attempts
    // if (!isUnique) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return res
    //     .status(500)
    //     .json({ msg: "Failed to generate unique invoice number" });
    // }

    if (req.body.tax) {
      type = "TAX";
      const taxCount = admin.taxCounter + 1;
      number = `PMST${taxCount}`;
      admin.taxCounter = taxCount;
    } else {
      const invoiceType = bill.type;
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
        select:
          "invoiceAmount.total contractDetails.sales billToDetails.name gstNo",
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
