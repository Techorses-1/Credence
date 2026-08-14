const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const ClientEnrollment = require("../models/ClientEnrollment");
const Client = require("../models/Client");
const ActivityLog = require("../models/ActivityLog");

const sendEmail = require("../utils/sendEmail");
const auth = require("../middleware/authMiddleware");
const AgreementPdf = require("../models/AgreementPdf");
const ClientConsent = require("../models/Clientconsent")
const router = express.Router();



/* ===============================
   CONSOLE LOGGING UTILITY
================================ */
const logToConsole = (type, operation, data) => {
  const timestamp = new Date().toLocaleString("en-IN");
  const logEntry = {
    timestamp,
    type,
    operation,
    data
  };

  console.log(`[${timestamp}] ${type}: ${operation}`, data);

  return logEntry;
};




router.post("/enroll", async (req, res) => {
  let enrollment = null;

  try {
    console.log("📨 FULL REQUEST BODY:", req.body);

    // ============================================
    // CAPTURE USER IP ADDRESS — backend only, no frontend needed
    // ============================================
    const userIp =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress ||
      "Unknown";

    logToConsole("INFO", "ENROLLMENT_IP_CAPTURED", { ip: userIp });

    // EXTRACT ALL FIELDS FROM REQUEST
    const enrollmentData = {
      firstName: req.body.firstName || '',
      lastName: req.body.lastName || '',
      address: req.body.address || '',
      visaType: req.body.visaType || '',
      hasStrongId: req.body.hasStrongId || '',
      mobile: req.body.mobile || '',
      email: req.body.email || '',
      businessAddress: req.body.businessAddress || '',
      bankAccount: req.body.bankAccount || '',
      bicCode: req.body.bicCode || '',
      businessName: req.body.businessName || '',
      vatPeriod: req.body.vatPeriod || '',
      businessNature: req.body.businessNature || '',
      registerTrade: req.body.registerTrade || '',
      planSelected: req.body.planSelected || '',
      ipAddress: userIp
    };

    console.log("📋 PROCESSED DATA:", enrollmentData);

    // Validate required fields
    if (!enrollmentData.firstName || !enrollmentData.lastName || !enrollmentData.email || !enrollmentData.mobile || !enrollmentData.planSelected) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
        missing: {
          firstName: !enrollmentData.firstName,
          lastName: !enrollmentData.lastName,
          email: !enrollmentData.email,
          mobile: !enrollmentData.mobile,
          planSelected: !enrollmentData.planSelected
        }
      });
    }

    // Check if email already exists
    const existingEnrollment = await ClientEnrollment.findOne({
      email: enrollmentData.email.toLowerCase().trim(),
      status: { $in: ["PENDING", "APPROVED"] }
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "An enrollment with this email already exists",
        currentStatus: existingEnrollment.status,
        enrollId: existingEnrollment.enrollId
      });
    }

    // Generate unique enrollment ID
    const enrollId = uuidv4();
    enrollmentData.enrollId = enrollId;
    enrollmentData.status = "PENDING";
    enrollmentData.email = enrollmentData.email.toLowerCase().trim();

    console.log("💾 FINAL DATA TO SAVE:", enrollmentData);

    // Create enrollment record
    enrollment = await ClientEnrollment.create(enrollmentData);

    console.log("✅ ENROLLMENT SAVED TO DB:", {
      _id: enrollment._id,
      enrollId: enrollment.enrollId,
      firstName: enrollment.firstName,
      lastName: enrollment.lastName,
      email: enrollment.email,
      mobile: enrollment.mobile,
      planSelected: enrollment.planSelected,
      ipAddress: enrollment.ipAddress
    });

    // Log the activity
    await ActivityLog.create({
      userName: `${enrollmentData.firstName} ${enrollmentData.lastName}`,
      role: "CLIENT",
      enrollId,
      action: "CLIENT_ENROLL",
      details: `Client enrollment submitted for ${enrollmentData.planSelected} plan`,
    });

    logToConsole("INFO", "ACTIVITY_LOG_CREATED", {
      action: "CLIENT_ENROLL",
      enrollId,
      clientName: `${enrollmentData.firstName} ${enrollmentData.lastName}`
    });

    // ===========================================
    // SEND NOTIFICATION EMAIL TO ADMIN
    // ===========================================
    try {
      const adminEmail = "support@jladgroup.fi";
      const currentDateTime = new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Kolkata"
      });

      const adminNotificationSubject = `🚨 New Client Enrollment - ${enrollment.businessName || enrollment.firstName + " " + enrollment.lastName}`;

      await sendEmail(
        adminEmail,
        adminNotificationSubject,
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Enrollment Notification</title>
            <style>
              body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; }
              .header { background: #111111; color: #ffffff; padding: 25px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 22px; color: #7cd64b; }
              .content { padding: 30px; background: #ffffff; }
              .alert-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
              .info-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .footer { background: #111111; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; }
              .section-title { color: #2c3e50; border-bottom: 2px solid #7cd64b; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px; }
              .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #dee2e6; font-size: 14px; }
              th { background: #f8f9fa; font-weight: 600; width: 35%; }
              .status-badge { display: inline-block; padding: 4px 10px; background: #ff9800; color: #000; border-radius: 12px; font-size: 12px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Credence Enterprise Accounting Services</h1>
              <p style="margin-top: 5px; opacity: 0.9; font-size: 14px;">Admin Notification - New Enrollment</p>
            </div>
            
            <div class="content">
              <div class="alert-box">
                <h2 style="margin-top: 0; color: #2196f3;">📋 New Client Enrollment Received!</h2>
                <p>A new client has submitted an enrollment form and is awaiting your review.</p>
                <p><strong>Submission Time:</strong> ${currentDateTime} EET/EEST</p>
              </div>
              
              <div class="info-box">
                <h3 class="section-title">📊 Enrollment Summary</h3>
                <table>
                  <tr><th>Enrollment ID</th><td><strong>${enrollment.enrollId}</strong></td></tr>
                  <tr><th>Client Name</th><td>${enrollment.firstName} ${enrollment.lastName}</td></tr>
                  <tr><th>Email</th><td>${enrollment.email}</td></tr>
                  <tr><th>Phone</th><td>${enrollment.mobile || "Not provided"}</td></tr>
                  <tr><th>Business Name</th><td>${enrollment.businessName || "Not provided"}</td></tr>
                  <tr><th>Selected Plan</th><td><strong>${enrollment.planSelected}</strong></td></tr>
                  <tr><th>IP Address</th><td>${userIp}</td></tr>
                  <tr><th>Current Status</th><td><span class="status-badge">PENDING REVIEW</span></td></tr>
                </table>
              </div>
              
              <div class="info-box">
                <h3 class="section-title">📝 Additional Details</h3>
                <table>
                  <tr><th>Visa Type</th><td>${enrollment.visaType || "Not provided"}</td></tr>
                  <tr><th>Strong ID Available</th><td>${enrollment.hasStrongId === "yes" ? "✅ Yes" : "❌ No"}</td></tr>
                  <tr><th>VAT Period</th><td>${enrollment.vatPeriod === "monthly" ? "Monthly" : "Quarterly"}</td></tr>
                  <tr><th>Nature of Business</th><td>${enrollment.businessNature || "Not specified"}</td></tr>
                  <tr><th>Trade Register</th><td>${enrollment.registerTrade === "yes" ? "✅ Registered" : "❌ Not Registered"}</td></tr>
                  <tr><th>Address</th><td>${enrollment.address || "Not provided"}</td></tr>
                </table>
              </div>

              <div style="margin-top: 25px; padding: 15px; background: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h4 style="margin-top: 0; color: #ff9800;">📋 Next Steps Required:</h4>
                <ol style="margin-bottom: 0;">
                  <li>Review the client's information in the admin panel</li>
                  <li>Verify business details and plan selection</li>
                  <li>Approve to create client account OR Reject with reason</li>
                  <li>System will automatically send approval/rejection email to client</li>
                </ol>
              </div>
            </div>
            
            <div class="footer">
              <p style="font-size: 16px; margin-bottom: 10px;"><strong>Credence Enterprise Accounting Services - Admin Panel</strong></p>
              <p style="margin-bottom: 10px; opacity: 0.9; font-size: 14px;">Professional Client Management System</p>
              <div class="dev-info">System Notification | Developed by Vapautus Media Private Limited</div>
              <p style="font-size: 12px; margin-top: 15px; opacity: 0.7;">
                © ${new Date().getFullYear()} Credence Enterprise Accounting Services. All rights reserved.<br>
                This is an automated notification email from the enrollment system.
              </p>
            </div>
          </body>
          </html>
        `
      );

      console.log("📧 ADMIN NOTIFICATION EMAIL SENT to:", adminEmail);
      logToConsole("INFO", "ADMIN_NOTIFICATION_SENT", {
        to: adminEmail,
        enrollId: enrollment.enrollId,
        clientName: `${enrollment.firstName} ${enrollment.lastName}`
      });

    } catch (emailError) {
      console.error("❌ ADMIN NOTIFICATION EMAIL FAILED:", emailError);
      logToConsole("ERROR", "ADMIN_NOTIFICATION_FAILED", {
        error: emailError.message,
        enrollId: enrollment.enrollId
      });
    }

    // ===========================================
    // FETCH ACTIVE AGREEMENT PDF — BUFFER FOR ATTACHMENT
    // AWS URL never exposed to client at any point
    // ===========================================
    let pdfAttachment = null;
    try {
      const activePdf = await AgreementPdf.findOne({ isActive: true }).lean();
      if (activePdf) {
        const fileResponse = await fetch(activePdf.fileUrl);
        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        pdfAttachment = {
          filename: "Agreement.pdf",
          content: buffer,
          contentType: "application/pdf"
        };
        logToConsole("INFO", "AGREEMENT_PDF_FETCHED_FOR_ATTACHMENT", {
          version: activePdf.version,
          size: buffer.length
        });
      } else {
        logToConsole("WARN", "NO_ACTIVE_AGREEMENT_PDF", { enrollId });
      }
    } catch (pdfErr) {
      logToConsole("WARN", "AGREEMENT_PDF_FETCH_FAILED", { error: pdfErr.message });
    }

    // ===========================================
    // SEND CONFIRMATION EMAIL TO CLIENT (PDF ATTACHED)
    // ===========================================
    try {
      const attachments = pdfAttachment ? [pdfAttachment] : [];

      await sendEmail(
        enrollment.email,
        "Enrollment Submitted Successfully - Credence Enterprise Accounting Services",
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enrollment Confirmation</title>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: #111111; color: #ffffff; padding: 25px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 22px; color: #7cd64b; }
              .content { padding: 25px; background: #ffffff; }
              .confirmation-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
              .info-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; margin: 15px 0; border-radius: 8px; }
              .pdf-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #7cd64b; }
              .footer { background: #111111; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; }
              .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Credence Enterprise Accounting Services</h1>
              <p style="margin-top: 5px; opacity: 0.9;">Enrollment Confirmation</p>
            </div>
            
            <div class="content">
              <div class="confirmation-box">
                <h2 style="margin-top: 0; color: #4caf50;">✅ Enrollment Submitted Successfully!</h2>
                <p>Dear ${enrollment.firstName} ${enrollment.lastName},</p>
                <p>Thank you for choosing Credence Enterprise Accounting Services. Your enrollment has been received and is currently under review.</p>
              </div>
              
              <div class="info-box">
                <p><strong>Enrollment ID:</strong> ${enrollment.enrollId}</p>
                <p><strong>Selected Plan:</strong> ${enrollment.planSelected}</p>
                <p><strong>Status:</strong> <span style="color: #ff9800; font-weight: 600;">Pending Review</span></p>
                <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">What Happens Next?</h3>
                <ol>
                  <li>Our team will review your application within 24-48 hours</li>
                  <li>You will receive an approval or rejection email with details</li>
                  <li>If approved, you'll get login credentials for your client portal</li>
                  <li>You can then upload documents and start using our services</li>
                </ol>
              </div>

              ${pdfAttachment ? `
              <div class="pdf-box">
                <h3 style="margin-top: 0; color: #2c3e50;">📄 Agreement Document</h3>
                <p>Please find the <strong>Agreement.pdf</strong> attached to this email.</p>
                <p>Kindly read the Terms &amp; Conditions carefully before your application is processed.</p>
              </div>
              ` : ''}

              <p style="margin-top: 20px;">If you have any questions, please contact our support team.</p>
              <p><strong>Email:</strong> support@jladgroup.fi</p>
              <p><strong>Phone:</strong> +358413250081</p>
              <p><strong>Business Hours:</strong> Monday to Friday, 9am to 3pm (EET/EEST)</p>
            </div>
            
            <div class="footer">
              <p><strong>Credence Enterprise Accounting Services</strong></p>
              <p>Professional Accounting | VAT Compliance | Business Advisory</p>
              <div class="dev-info">Developed by Vapautus Media Private Limited</div>
              <p style="font-size: 12px; margin-top: 10px;">
                This email confirms your enrollment submission.<br>
                Please do not reply to this automated email.
              </p>
            </div>
          </body>
          </html>
        `,
        attachments
      );

      console.log("📧 CLIENT CONFIRMATION EMAIL SENT to:", enrollment.email);
      logToConsole("INFO", "CLIENT_CONFIRMATION_EMAIL_SENT", {
        to: enrollment.email,
        enrollId: enrollment.enrollId,
        agreementPdfAttached: !!pdfAttachment
      });

    } catch (clientEmailError) {
      console.error("❌ CLIENT CONFIRMATION EMAIL FAILED:", clientEmailError);
      logToConsole("ERROR", "CLIENT_CONFIRMATION_EMAIL_FAILED", {
        email: enrollment.email,
        error: clientEmailError.message,
        enrollId: enrollment.enrollId
      });
    }

    res.status(201).json({
      success: true,
      message: "Enrollment submitted successfully",
      enrollId,
      status: "PENDING",
      savedData: {
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        email: enrollment.email,
        mobile: enrollment.mobile
      }
    });

    logToConsole("SUCCESS", "CLIENT_ENROLLMENT_COMPLETE", {
      enrollId,
      clientName: `${enrollment.firstName} ${enrollment.lastName}`,
      email: enrollment.email,
      planSelected: enrollment.planSelected,
      ipAddress: userIp
    });

  } catch (error) {
    console.error("❌ ENROLLMENT ERROR:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors
    });

    logToConsole("ERROR", "CLIENT_ENROLLMENT_FAILED", {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate enrollment detected",
        error: "DUPLICATE_ENROLLMENT"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during enrollment",
      error: error.message
    });
  }
});


/* ==============================================
   HELPER FUNCTION TO LOCK PAST MONTHS
============================================== */
const lockPastMonthsForClient = (currentYear, currentMonth) => {
  const documents = new Map();
  const currentYearStr = currentYear.toString();

  // Initialize current year
  documents.set(currentYearStr, new Map());

  // Calculate which months to lock (all months before current month)
  for (let month = 1; month < currentMonth; month++) {
    const monthStr = month.toString();
    const monthData = {
      sales: {
        files: [],
        isLocked: true, // LOCKED
        lockedAt: new Date(),
        lockedBy: "system-auto-lock",
        categoryNotes: [{
          note: `Month automatically locked (past month)`,
          addedBy: "system",
          addedAt: new Date(),
          viewedBy: []
        }],
        wasLockedOnce: true
      },
      purchase: {
        files: [],
        isLocked: true, // LOCKED
        lockedAt: new Date(),
        lockedBy: "system-auto-lock",
        categoryNotes: [{
          note: `Month automatically locked (past month)`,
          addedBy: "system",
          addedAt: new Date(),
          viewedBy: []
        }],
        wasLockedOnce: true
      },
      bank: {
        files: [],
        isLocked: true, // LOCKED
        lockedAt: new Date(),
        lockedBy: "system-auto-lock",
        categoryNotes: [{
          note: `Month automatically locked (past month)`,
          addedBy: "system",
          addedAt: new Date(),
          viewedBy: []
        }],
        wasLockedOnce: true
      },
      other: [],
      isLocked: true, // MONTH ITSELF LOCKED
      wasLockedOnce: true,
      lockedAt: new Date(),
      lockedBy: "system-auto-lock",
      monthNotes: [{
        note: `Complete month locked automatically (past month)`,
        addedBy: "system",
        addedAt: new Date(),
        viewedBy: []
      }],
      accountingDone: false,
      monthActiveStatus: "active"
    };

    documents.get(currentYearStr).set(monthStr, monthData);
  }

  // Initialize current month (unlocked)
  const currentMonthStr = currentMonth.toString();
  documents.get(currentYearStr).set(currentMonthStr, {
    sales: { files: [], isLocked: false, categoryNotes: [], wasLockedOnce: false },
    purchase: { files: [], isLocked: false, categoryNotes: [], wasLockedOnce: false },
    bank: { files: [], isLocked: false, categoryNotes: [], wasLockedOnce: false },
    other: [],
    isLocked: false,
    wasLockedOnce: false,
    monthNotes: [],
    accountingDone: false,
    monthActiveStatus: "active"
  });

  return documents;
};




/* ==============================================
   HELPER FUNCTION TO CREATE MONTHS DATA FOR NEW COLLECTION
   Returns months array for ClientMonthlyData collection
============================================== */
const createMonthsDataForNewClient = (currentYear, currentMonth) => {
  const monthsArray = [];

  // Create locked months for all past months (Jan to last month)
  for (let month = 1; month < currentMonth; month++) {
    monthsArray.push({
      year: currentYear,
      month: month,
      sales: {
        files: [],
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: "system-auto-lock",
        categoryNotes: [{
          note: `Month automatically locked (past month)`,
          addedBy: "system",
          addedAt: new Date(),
          viewedBy: []
        }],
        wasLockedOnce: true
      },
      purchase: {
        files: [],
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: "system-auto-lock",
        categoryNotes: [{
          note: `Month automatically locked (past month)`,
          addedBy: "system",
          addedAt: new Date(),
          viewedBy: []
        }],
        wasLockedOnce: true
      },
      bank: {
        files: [],
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: "system-auto-lock",
        categoryNotes: [{
          note: `Month automatically locked (past month)`,
          addedBy: "system",
          addedAt: new Date(),
          viewedBy: []
        }],
        wasLockedOnce: true
      },
      other: [],
      isLocked: true,
      wasLockedOnce: true,
      lockedAt: new Date(),
      lockedBy: "system-auto-lock",
      monthNotes: [{
        note: `Complete month locked automatically (past month)`,
        addedBy: "system",
        addedAt: new Date(),
        viewedBy: []
      }],
      accountingDone: false,
      monthActiveStatus: "active"
    });
  }

  // Create current month (unlocked)
  monthsArray.push({
    year: currentYear,
    month: currentMonth,
    sales: { files: [], isLocked: false, categoryNotes: [], wasLockedOnce: false },
    purchase: { files: [], isLocked: false, categoryNotes: [], wasLockedOnce: false },
    bank: { files: [], isLocked: false, categoryNotes: [], wasLockedOnce: false },
    other: [],
    isLocked: false,
    wasLockedOnce: false,
    monthNotes: [],
    accountingDone: false,
    monthActiveStatus: "active"
  });

  return monthsArray;
};



router.post("/action", auth, async (req, res) => {
  try {
    const { enrollId, action, rejectionReason } = req.body;

    logToConsole("INFO", "ADMIN_ACTION_REQUEST", {
      enrollId,
      action,
      adminId: req.user.adminId,
      adminName: req.user.name
    });

    // 1. FIND ENROLLMENT
    const enrollment = await ClientEnrollment.findOne({ enrollId });
    if (!enrollment) {
      logToConsole("WARN", "ENROLLMENT_NOT_FOUND", {
        enrollId,
        adminId: req.user.adminId
      });
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    logToConsole("DEBUG", "ENROLLMENT_FOUND", {
      enrollId: enrollment.enrollId,
      email: enrollment.email,
      status: enrollment.status
    });

    // Get current date and time for email
    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const currentTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Helsinki"
    });

    // ============================================
    // 2. REJECT ENROLLMENT
    // ============================================
    if (action === "REJECT") {
      enrollment.status = "REJECTED";
      enrollment.reviewedBy = req.user.adminId;
      enrollment.reviewedAt = new Date();
      enrollment.rejectionReason = rejectionReason || "No reason provided";

      await enrollment.save();

      logToConsole("INFO", "ENROLLMENT_REJECTED", {
        enrollId: enrollment.enrollId,
        email: enrollment.email,
        adminId: req.user.adminId
      });

      try {
        await sendEmail(
          enrollment.email,
          `Application Status Update - ${enrollment.businessName || "Your Business"} | Credence Enterprise Accounting Services`,
          `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Application Status Update</title>
              <style>
                body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: #111111; color: #ffffff; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; color: #7cd64b; }
                .content { padding: 30px; background: #ffffff; }
                .status-box { background: #fff5f5; border-left: 4px solid #ff6b6b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
                .info-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px; }
                .footer { background: #111111; color: #ffffff; padding: 20px; text-align: center; border-top: 1px solid #dee2e6; }
                .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
                .section-title { color: #2c3e50; border-bottom: 2px solid #7cd64b; padding-bottom: 8px; margin-bottom: 20px; }
                .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Credence Enterprise Accounting Services</h1>
                <p style="margin-top: 5px; opacity: 0.9;">Professional Accounting & VAT Compliance</p>
              </div>

              <div class="content">
                <h2 style="color: #2c3e50; margin-top: 0;">Dear ${enrollment.firstName} ${enrollment.lastName},</h2>

                <p>Thank you for your interest in Credence Enterprise Accounting Services. We have reviewed your application submitted on ${new Date(enrollment.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</p>

                <div class="status-box">
                  <h3 style="color: #ff6b6b; margin-top: 0;">Application Status: <strong>Rejected</strong></h3>
                  <p><strong>Application ID:</strong> ${enrollment.enrollId}</p>
                  <p><strong>Review Date:</strong> ${currentDate}</p>
                  <p><strong>Review Time:</strong> ${currentTime} EET/EEST</p>
                  <p><strong>Review By:</strong> ${req.user.name || "Administrator"}</p>
                </div>

                <div class="info-box">
                  <h4 class="section-title">Reason for Rejection</h4>
                  <p>${enrollment.rejectionReason || "No specific reason provided."}</p>
                </div>

                <div class="info-box">
                  <h4 class="section-title">Application Details</h4>
                  <p><strong>Business Name:</strong> ${enrollment.businessName || "Not provided"}</p>
                  <p><strong>Selected Plan:</strong> ${enrollment.planSelected || "Not selected"}</p>
                  <p><strong>Contact Email:</strong> ${enrollment.email}</p>
                  <p><strong>Contact Phone:</strong> ${enrollment.mobile || "Not provided"}</p>
                </div>

                <p>If you believe there has been an error, or if you wish to provide additional information, please feel free to contact our support team for clarification.</p>

                <div class="contact-info">
                  <h4 class="section-title">📞 Our Contact Information</h4>
                  <p><strong>Email:</strong> support@jladgroup.fi</p>
                  <p><strong>Phone Support:</strong> +358413250081</p>
                  <p><strong>Business Hours:</strong> Monday to Fri 9am to 3pm (EET/EEST)</p>
                </div>
              </div>

              <div class="footer">
                <p><strong>Credence Enterprise Accounting Services</strong></p>
                <p>Professional Accounting | VAT Compliance | Business Advisory</p>
                <p>© ${new Date().getFullYear()} Credence Enterprise Accounting Services. All rights reserved.</p>
                <div class="dev-info">Developed by Vapautus Media Private Limited</div>
                <p style="font-size: 12px; margin-top: 10px;">
                  This email was sent to ${enrollment.email} regarding your application.<br>
                  Please do not reply to this automated email.
                </p>
              </div>
            </body>
            </html>
          `
        );
        logToConsole("INFO", "REJECTION_EMAIL_SENT", {
          to: enrollment.email,
          enrollId: enrollment.enrollId
        });
      } catch (emailError) {
        logToConsole("ERROR", "REJECTION_EMAIL_FAILED", {
          email: enrollment.email,
          error: emailError.message,
          enrollId: enrollment.enrollId
        });
      }

      await ActivityLog.create({
        userName: req.user.name,
        role: "ADMIN",
        adminId: req.user.adminId,
        enrollId,
        action: "CLIENT_REJECTED",
        details: `Client enrollment rejected. Reason: ${enrollment.rejectionReason}`,
      });

      logToConsole("INFO", "ACTIVITY_LOG_CREATED", {
        action: "CLIENT_REJECTED",
        adminId: req.user.adminId,
        enrollId: enrollment.enrollId
      });

      return res.json({
        success: true,
        message: "Client enrollment rejected successfully",
        enrollId: enrollment.enrollId,
        status: "REJECTED"
      });
    }

    // ============================================
    // 3. APPROVE ENROLLMENT (UPDATED FOR NEW COLLECTION)
    // ============================================
    if (action === "APPROVE") {
      const existingClient = await Client.findOne({ email: enrollment.email });

      if (existingClient) {
        logToConsole("WARN", "DUPLICATE_CLIENT_EMAIL", {
          email: enrollment.email,
          existingClientId: existingClient.clientId,
          adminId: req.user.adminId
        });
        return res.status(409).json({
          success: false,
          message: "A client with this email already exists",
          clientId: existingClient.clientId
        });
      }

      // Generate client ID and password
      const clientId = uuidv4();
      const plainPassword = `${enrollment.firstName.trim()}@1234`;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Auto-lock past months - create data for NEW collection
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      logToConsole("INFO", "AUTO-LOCKING PAST MONTHS FOR NEW CLIENT", {
        currentYear,
        currentMonth,
        monthsToLock: currentMonth > 1 ? `January to ${currentMonth - 1}` : "No months to lock"
      });

      // Create months data for NEW collection
      const monthsData = createMonthsDataForNewClient(currentYear, currentMonth);

      // Client gets EMPTY documents (no old structure)
      const clientData = {
        clientId,
        name: `${enrollment.firstName} ${enrollment.lastName}`,
        email: enrollment.email.toLowerCase().trim(),
        phone: enrollment.mobile,
        address: enrollment.address,
        password: hashedPassword,
        isActive: true,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        visaType: enrollment.visaType,
        hasStrongId: enrollment.hasStrongId,
        businessAddress: enrollment.businessAddress,
        bankAccount: enrollment.bankAccount,
        bicCode: enrollment.bicCode,
        businessName: enrollment.businessName,
        vatPeriod: enrollment.vatPeriod,
        businessNature: enrollment.businessNature,
        registerTrade: enrollment.registerTrade,
        planSelected: enrollment.planSelected,
        currentPlan: enrollment.planSelected,
        enrollmentId: enrollment.enrollId,
        enrollmentDate: new Date(),
        documents: new Map(), // 👈 EMPTY Map - no old structure
        employeeAssignments: []
      };

      logToConsole("INFO", "CREATING_CLIENT", {
        clientId,
        email: clientData.email,
        planSelected: clientData.planSelected,
        adminId: req.user.adminId,
        autoLockedMonths: currentMonth > 1 ? `Months 1-${currentMonth - 1} locked` : "No months locked"
      });

      // Create client account
      const client = await Client.create(clientData);
      logToConsole("INFO", "CLIENT_CREATED", {
        clientId: client.clientId,
        name: client.name,
        adminId: req.user.adminId
      });

      // ===== CREATE ENTRY IN NEW ClientMonthlyData COLLECTION =====
      try {
        const ClientMonthlyData = require("../models/ClientMonthlyData");
        await ClientMonthlyData.create({
          clientId: client.clientId,
          clientName: client.name,
          clientEmail: client.email,
          months: monthsData  // 👈 Store locked months in NEW collection
        });
        logToConsole("INFO", "CLIENT_MONTHLY_DATA_CREATED", {
          clientId: client.clientId,
          monthsCount: monthsData.length,
          lockedMonths: monthsData.filter(m => m.isLocked).length
        });
      } catch (monthlyDataError) {
        logToConsole("ERROR", "CLIENT_MONTHLY_DATA_CREATION_FAILED", {
          clientId: client.clientId,
          error: monthlyDataError.message
        });
        // Don't fail client creation if this fails
      }

      // Update enrollment status
      enrollment.status = "APPROVED";
      enrollment.reviewedBy = req.user.adminId;
      enrollment.reviewedAt = new Date();
      enrollment.clientId = clientId;
      await enrollment.save();

      logToConsole("INFO", "ENROLLMENT_APPROVED", {
        enrollId: enrollment.enrollId,
        clientId,
        adminId: req.user.adminId
      });

      // ============================================
      // FETCH ACTIVE AGREEMENT PDF
      // ============================================
      let pdfAttachment = null;
      let activePdfUrl = "";

      try {
        const activePdf = await AgreementPdf.findOne({ isActive: true }).lean();
        if (activePdf) {
          activePdfUrl = activePdf.fileUrl;
          const fileResponse = await fetch(activePdf.fileUrl);
          const arrayBuffer = await fileResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          pdfAttachment = {
            filename: "Agreement.pdf",
            content: buffer,
            contentType: "application/pdf"
          };
          logToConsole("INFO", "AGREEMENT_PDF_FETCHED", {
            version: activePdf.version,
            size: buffer.length
          });
        } else {
          logToConsole("WARN", "NO_ACTIVE_AGREEMENT_PDF", { enrollId });
        }
      } catch (pdfErr) {
        logToConsole("WARN", "AGREEMENT_PDF_FETCH_FAILED", { error: pdfErr.message });
      }

      // ============================================
      // CREATE CLIENT CONSENT RECORD
      // ============================================
      try {
        const enrollmentDate = new Date(enrollment.createdAt);
        const consentDate = enrollmentDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
        const consentTime = enrollmentDate.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Europe/Helsinki"
        });

        await ClientConsent.create({
          clientId,
          name: `${enrollment.firstName} ${enrollment.lastName}`,
          email: enrollment.email.toLowerCase().trim(),
          phone: enrollment.mobile || "",
          consentHistory: [
            {
              ipAddress: enrollment.ipAddress || "Unknown",
              acceptAgreement: true,
              date: consentDate,
              time: consentTime,
              agreementPdfUrl: activePdfUrl,
              recordedAt: enrollmentDate
            }
          ]
        });

        logToConsole("INFO", "CLIENT_CONSENT_CREATED", {
          clientId,
          enrollId: enrollment.enrollId,
          ipAddress: enrollment.ipAddress
        });
      } catch (consentErr) {
        logToConsole("ERROR", "CLIENT_CONSENT_CREATION_FAILED", {
          clientId,
          error: consentErr.message,
          enrollId: enrollment.enrollId
        });
      }

      // ============================================
      // SEND WELCOME EMAIL TO CLIENT
      // ============================================
      try {
        const portalUrl = "https://jladgroup.fi/login";
        const attachments = pdfAttachment ? [pdfAttachment] : [];

        await sendEmail(
          enrollment.email,
          `Welcome to Credence Enterprise Accounting Services - Account Approved & Activated`,
          `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Account Approval Confirmation</title>
              <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
                .header { background: #111111; color: #ffffff; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 26px; color: #7cd64b; }
                .content { padding: 35px; background: #ffffff; }
                .credentials-box { background: #f0f9ff; border: 2px solid #7cd64b; padding: 25px; margin: 25px 0; border-radius: 8px; }
                .client-info { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px; }
                .important-box { background: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
                .pdf-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #7cd64b; }
                .footer { background: #111111; color: #ffffff; padding: 25px; text-align: center; }
                .login-button { display: inline-block; padding: 14px 32px; background: #7cd64b; color: #000000; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 16px; margin: 15px 0; }
                .section-title { color: #2c3e50; border-bottom: 2px solid #7cd64b; padding-bottom: 10px; margin-bottom: 20px; font-size: 18px; }
                .highlight { background: #7cd64b; color: #000000; padding: 3px 6px; border-radius: 3px; font-weight: 600; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #dee2e6; }
                th { background: #f8f9fa; font-weight: 600; }
                .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Credence Enterprise Accounting Services</h1>
                <p style="margin-top: 5px; opacity: 0.9;">Professional Accounting | VAT Compliance | Business Advisory</p>
              </div>

              <div class="content">
                <h2 style="color: #2c3e50; margin-top: 0;">Welcome ${enrollment.firstName} ${enrollment.lastName}!</h2>

                <p>We are pleased to inform you that your application has been <span class="highlight">APPROVED</span> and your client account has been successfully activated.</p>

                <div class="credentials-box">
                  <h3 class="section-title">🔐 Your Portal Access Credentials</h3>
                  <p><strong>Client Portal URL:</strong> <a href="${portalUrl}" style="color: #7cd64b; text-decoration: none;">${portalUrl}</a></p>
                  <table>
                    <tr><th>Email Address</th><td>${enrollment.email}</td></tr>
                    <tr><th>Temporary Password</th><td><strong>${plainPassword}</strong></td></tr>
                    <tr><th>Client ID</th><td>${clientId}</td></tr>
                  </table>
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="${portalUrl}" class="login-button">Login to Client Portal</a>
                  </div>
                  <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
                    <strong>Important:</strong> Please change your password after first login for security.
                  </p>
                </div>

                <div class="client-info">
                  <h3 class="section-title">📋 Your Account Details</h3>
                  <table>
                    <tr><th>Application Approved On</th><td>${currentDate} at ${currentTime} EET/EEST</td></tr>
                    <tr><th>Approved By</th><td>${req.user.name || "Administrator"}</td></tr>
                    <tr><th>Business Name</th><td>${enrollment.businessName || "Not specified"}</td></tr>
                    <tr><th>Selected Plan</th><td><strong>${enrollment.planSelected}</strong></td></tr>
                    <tr><th>VAT Period</th><td>${enrollment.vatPeriod || "Not specified"}</td></tr>
                    <tr><th>Enrollment ID</th><td>${enrollment.enrollId}</td></tr>
                  </table>
                </div>

                <div class="important-box">
                  <h3 class="section-title">✅ Acceptance Confirmation</h3>
                  <p>By using our services and accessing the client portal, you acknowledge and agree to our <strong>Terms &amp; Conditions and Privacy Policy</strong>.</p>
                  <p style="margin-top: 15px;">
                    <strong>Approval Time:</strong> ${currentDate} at ${currentTime} EET/EEST<br>
                    <strong>Service Start Date:</strong> ${currentDate}
                  </p>
                </div>

                ${pdfAttachment ? `
                <div class="pdf-box">
                  <h3 style="margin-top: 0; color: #2c3e50;">📄 Agreement Document</h3>
                  <p>Please find the <strong>Agreement.pdf</strong> attached to this email.</p>
                  <p>Kindly read the Terms &amp; Conditions carefully. By accessing your portal and using our services, you confirm that you have read, understood, and agreed to all terms.</p>
                </div>
                ` : ''}

                <p style="background: #e7f4ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                  <strong>Note:</strong> By accessing your client portal and using our services, you acknowledge that you have read, understood, and agree to all the terms and conditions in the attached agreement.
                </p>

                <div class="contact-info">
                  <h3 class="section-title">📞 Our Contact Information</h3>
                  <p><strong>Email:</strong> support@jladgroup.fi</p>
                  <p><strong>Phone Support:</strong> +358413250081</p>
                  <p><strong>Business Hours:</strong> Monday to Fri 9am to 3pm (EET/EEST)</p>
                </div>
              </div>

              <div class="footer">
                <p><strong>Credence Enterprise Accounting Services</strong></p>
                <p>Professional Accounting | VAT Compliance | Business Advisory</p>
                <div class="dev-info">Developed by Vapautus Media Private Limited</div>
                <p style="font-size: 12px; margin-top: 10px;">
                  © ${new Date().getFullYear()} Credence Enterprise Accounting Services. All rights reserved.<br>
                  Please retain this email and the attached agreement for your records.
                </p>
              </div>
            </body>
            </html>
          `,
          attachments
        );

        logToConsole("INFO", "WELCOME_EMAIL_SENT", {
          to: enrollment.email,
          clientId,
          enrollId: enrollment.enrollId,
          agreementPdfAttached: !!pdfAttachment
        });
      } catch (emailError) {
        logToConsole("ERROR", "WELCOME_EMAIL_FAILED", {
          email: enrollment.email,
          error: emailError.message,
          enrollId: enrollment.enrollId
        });
      }

      await ActivityLog.create({
        userName: req.user.name,
        role: "ADMIN",
        adminId: req.user.adminId,
        enrollId,
        clientId,
        action: "CLIENT_APPROVED",
        details: `Client approved and account created for ${enrollment.planSelected} plan. Data stored in new ClientMonthlyData collection.`,
        metadata: {
          clientName: clientData.name,
          planSelected: clientData.planSelected,
          email: clientData.email,
          autoLockedMonths: currentMonth > 1 ? `January to ${new Date(currentYear, currentMonth - 2).toLocaleString('default', { month: 'long' })}` : 'None'
        }
      });

      logToConsole("INFO", "ACTIVITY_LOG_CREATED", {
        action: "CLIENT_APPROVED",
        adminId: req.user.adminId,
        enrollId: enrollment.enrollId,
        clientId
      });

      return res.json({
        success: true,
        message: "Client approved & account created successfully",
        clientId,
        clientName: clientData.name,
        clientEmail: clientData.email,
        planSelected: clientData.planSelected,
        temporaryPassword: plainPassword,
        enrollId: enrollment.enrollId,
        approvalDate: currentDate,
        approvalTime: currentTime,
        autoLockInfo: {
          lockedMonths: currentMonth > 1 ? Array.from({ length: currentMonth - 1 }, (_, i) => i + 1) : [],
          currentMonth: currentMonth,
          currentYear: currentYear,
          message: currentMonth > 1 ? `Months January to ${new Date(currentYear, currentMonth - 2).toLocaleString('default', { month: 'long' })} have been automatically locked` : "No past months to lock",
          storageLocation: "ClientMonthlyData collection (new)"
        }
      });
    }

    // 4. INVALID ACTION
    logToConsole("WARN", "INVALID_ACTION", {
      action,
      adminId: req.user.adminId
    });
    return res.status(400).json({
      success: false,
      message: "Invalid action. Use 'APPROVE' or 'REJECT'"
    });

  } catch (error) {
    logToConsole("ERROR", "ADMIN_ACTION_FAILED", {
      error: error.message,
      stack: error.stack,
      enrollId: req.body.enrollId,
      action: req.body.action,
      adminId: req.user?.adminId
    });

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate client detected. Please try again.",
        error: "DUPLICATE_CLIENT"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during admin action",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});




/* ===============================
   ADMIN VIEW ALL ENROLLMENTS
================================ */
router.get("/all", auth, async (req, res) => {
  try {
    logToConsole("INFO", "GET_ALL_ENROLLMENTS_REQUEST", {
      adminId: req.user.adminId,
      adminName: req.user.name
    });

    const data = await ClientEnrollment.find().sort({ createdAt: -1 });

    // Create activity log for viewing all enrollments
    await ActivityLog.create({
      userName: req.user.name,
      role: "ADMIN",
      adminId: req.user.adminId,
      action: "ALL_ENROLLMENTS_VIEWED",
      details: `Admin viewed all client enrollments (${data.length} records)`,
      // dateTime: new Date().toLocaleString("en-IN")
    });

    logToConsole("INFO", "ACTIVITY_LOG_CREATED", {
      action: "ALL_ENROLLMENTS_VIEWED",
      adminId: req.user.adminId,
      count: data.length
    });

    logToConsole("SUCCESS", "ALL_ENROLLMENTS_FETCHED", {
      count: data.length,
      adminId: req.user.adminId
    });

    res.json({
      success: true,
      count: data.length,
      enrollments: data
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);

    logToConsole("ERROR", "GET_ALL_ENROLLMENTS_FAILED", {
      error: error.message,
      stack: error.stack,
      adminId: req.user?.adminId
    });

    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/* ===============================
   ADMIN VIEW SINGLE ENROLLMENT
================================ */
router.get("/:enrollId", auth, async (req, res) => {
  try {
    logToConsole("INFO", "GET_SINGLE_ENROLLMENT_REQUEST", {
      adminId: req.user.adminId,
      adminName: req.user.name,
      enrollId: req.params.enrollId
    });

    const enrollment = await ClientEnrollment.findOne({
      enrollId: req.params.enrollId
    });

    if (!enrollment) {
      logToConsole("WARN", "ENROLLMENT_NOT_FOUND", {
        enrollId: req.params.enrollId,
        adminId: req.user.adminId
      });
      return res.status(404).json({
        message: "Enrollment not found",
        success: false
      });
    }

    // Create activity log for viewing single enrollment
    await ActivityLog.create({
      userName: req.user.name,
      role: "ADMIN",
      adminId: req.user.adminId,
      enrollId: enrollment.enrollId,
      action: "SINGLE_ENROLLMENT_VIEWED",
      details: `Admin viewed enrollment details for ${enrollment.firstName} ${enrollment.lastName}`,
      // dateTime: new Date().toLocaleString("en-IN"),
      metadata: {
        clientName: `${enrollment.firstName} ${enrollment.lastName}`,
        email: enrollment.email,
        status: enrollment.status,
        planSelected: enrollment.planSelected
      }
    });

    logToConsole("INFO", "ACTIVITY_LOG_CREATED", {
      action: "SINGLE_ENROLLMENT_VIEWED",
      adminId: req.user.adminId,
      enrollId: enrollment.enrollId
    });

    logToConsole("SUCCESS", "SINGLE_ENROLLMENT_FETCHED", {
      enrollId: enrollment.enrollId,
      clientName: `${enrollment.firstName} ${enrollment.lastName}`,
      status: enrollment.status
    });

    res.json({
      success: true,
      enrollment
    });
  } catch (error) {
    console.error("Error fetching enrollment:", error);

    logToConsole("ERROR", "GET_SINGLE_ENROLLMENT_FAILED", {
      error: error.message,
      stack: error.stack,
      enrollId: req.params.enrollId,
      adminId: req.user?.adminId
    });

    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



/* ===============================
   GET SINGLE ENROLLMENT DETAILS (FOR VIEW MODAL)
================================ */

router.get("/enrollment/:enrollId", auth, async (req, res) => {
  try {
    logToConsole("INFO", "GET_ENROLLMENT_DETAILS_REQUEST", {
      adminId: req.user.adminId,
      adminName: req.user.name,
      enrollId: req.params.enrollId
    });

    const enrollment = await ClientEnrollment.findOne({
      enrollId: req.params.enrollId
    });

    if (!enrollment) {
      logToConsole("WARN", "ENROLLMENT_NOT_FOUND_DETAILS", {
        enrollId: req.params.enrollId,
        adminId: req.user.adminId
      });
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    // Create activity log for viewing enrollment details
    await ActivityLog.create({
      userName: req.user.name,
      role: "ADMIN",
      adminId: req.user.adminId,
      enrollId: enrollment.enrollId,
      action: "ENROLLMENT_DETAILS_VIEWED",
      details: `Admin viewed detailed enrollment information for ${enrollment.firstName} ${enrollment.lastName}`,
      // dateTime: new Date().toLocaleString("en-IN"),
      metadata: {
        clientName: `${enrollment.firstName} ${enrollment.lastName}`,
        email: enrollment.email,
        status: enrollment.status,
        planSelected: enrollment.planSelected
      }
    });

    logToConsole("INFO", "ACTIVITY_LOG_CREATED", {
      action: "ENROLLMENT_DETAILS_VIEWED",
      adminId: req.user.adminId,
      enrollId: enrollment.enrollId
    });

    logToConsole("SUCCESS", "ENROLLMENT_DETAILS_FETCHED", {
      enrollId: enrollment.enrollId,
      clientName: `${enrollment.firstName} ${enrollment.lastName}`,
      status: enrollment.status
    });

    res.json({
      success: true,
      enrollment: {
        enrollId: enrollment.enrollId,
        status: enrollment.status,
        createdAt: enrollment.createdAt,

        // Personal Information
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        name: `${enrollment.firstName} ${enrollment.lastName}`,
        address: enrollment.address,
        visaType: enrollment.visaType,
        hasStrongId: enrollment.hasStrongId,
        mobile: enrollment.mobile,
        email: enrollment.email,

        // Business Information
        businessAddress: enrollment.businessAddress,
        bankAccount: enrollment.bankAccount,
        bicCode: enrollment.bicCode,
        businessName: enrollment.businessName,
        vatPeriod: enrollment.vatPeriod,
        businessNature: enrollment.businessNature,
        registerTrade: enrollment.registerTrade,
        planSelected: enrollment.planSelected,

        // Review Information
        reviewedBy: enrollment.reviewedBy,
        reviewedAt: enrollment.reviewedAt,
        clientId: enrollment.clientId,
        rejectionReason: enrollment.rejectionReason
      }
    });
  } catch (error) {
    console.error("Error fetching enrollment:", error);

    logToConsole("ERROR", "GET_ENROLLMENT_DETAILS_FAILED", {
      error: error.message,
      stack: error.stack,
      enrollId: req.params.enrollId,
      adminId: req.user?.adminId
    });

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


module.exports = router;