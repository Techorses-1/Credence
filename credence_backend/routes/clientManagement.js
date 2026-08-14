const express = require("express");
const mongoose = require("mongoose");
const Client = require("../models/Client");
const auth = require("../middleware/authMiddleware");
const ActivityLog = require("../models/ActivityLog");
const FinancialStatementRequest = require('../models/FinancialStatementRequestNew');
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// Console logging helper
const logToConsole = (type, operation, data) => {
  const timestamp = new Date().toLocaleString("en-IN");
  console.log(`[${timestamp}] ${type}: ${operation}`, data);
};

// ============================================
// GET ALL CLIENTS (FOR ACTIVE CONTROL & CLIENTS DATA)
// ============================================
router.get("/all-clients", auth, async (req, res) => {
  try {
    const clients = await Client.find()
      .select("clientId name email phone firstName lastName visaType hasStrongId businessName vatPeriod businessNature registerTrade planSelected isActive enrollmentDate createdAt")
      .sort({ createdAt: -1 });

    try {
      await ActivityLog.create({
        userName: req.user.name,
        role: req.user.role,
        adminId: req.user.adminId,
        action: "ALL_CLIENTS_VIEWED",
        details: `Viewed all clients list. Total: ${clients.length} clients`,
        dateTime: new Date(),
        metadata: {
          totalClients: clients.length
        }
      });
    } catch (logError) {
      logToConsole("ERROR", "ACTIVITY_LOG_FAILED", {
        error: logError.message,
        adminId: req.user.adminId
      });
    }

    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching clients",
      error: error.message
    });
  }
});

// ============================================
// TOGGLE CLIENT ACTIVE STATUS - WITH EMAIL NOTIFICATION
// ============================================
router.patch("/toggle-status/:clientId", auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { isActive, reason } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value"
      });
    }

    const clientBefore = await Client.findOne({ clientId })
      .select("clientId name email firstName lastName businessName phone isActive");

    if (!clientBefore) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    const currentDate = new Date();

    const updateObj = {
      isActive,
      ...(isActive === false ? {
        deactivatedAt: currentDate,
        deactivatedBy: req.user.adminId,
        deactivationReason: reason || "No reason provided",
        reactivatedAt: null,
        reactivatedBy: null,
        reactivationReason: null
      } : {
        reactivatedAt: currentDate,
        reactivatedBy: req.user.adminId,
        reactivationReason: reason || "No reason provided"
      })
    };

    updateObj.$push = {
      globalStatusHistory: {
        status: isActive ? 'active' : 'inactive',
        changedAt: currentDate,
        changedBy: req.user.adminId,
        adminName: req.user.name,
        reason: reason || "No reason provided",
        metadata: {
          action: isActive ? 'REACTIVATION' : 'DEACTIVATION'
        }
      }
    };

    const client = await Client.findOneAndUpdate(
      { clientId },
      updateObj,
      { new: true }
    ).select("-password -documents -employeeAssignments");

    try {
      await ActivityLog.create({
        userName: req.user.name,
        role: req.user.role,
        adminId: req.user.adminId,
        clientId: clientId,
        action: isActive ? "CLIENT_REACTIVATED" : "CLIENT_DEACTIVATED",
        details: `${isActive ? 'Reactivated' : 'Deactivated'} client: ${clientBefore.name} (${clientId})${reason ? `. Reason: ${reason}` : ''}`,
        dateTime: new Date(),
        metadata: {
          clientId,
          clientName: clientBefore.name,
          previousStatus: clientBefore.isActive,
          newStatus: isActive,
          changedByAdmin: req.user.name,
          reason: reason || "No reason provided"
        }
      });
    } catch (logError) {
      console.error("Activity log failed:", logError);
    }

    try {
      if (client.email) {
        const currentDateTime = new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const emailSubject = isActive
          ? `✅ Account Reactivated - ${client.businessName || client.name}`
          : `⚠️ Account Deactivated - ${client.businessName || client.name}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Status Update</title>
            <style>
              body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: #111111; color: #ffffff; padding: 30px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; color: #7cd64b; }
              .content { padding: 30px; background: #ffffff; }
              .status-box { 
                background: ${isActive ? '#e8f5e9' : '#ffebee'}; 
                border-left: 4px solid ${isActive ? '#4caf50' : '#f44336'}; 
                padding: 20px; 
                margin: 25px 0; 
                border-radius: 0 8px 8px 0;
              }
              .client-info { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px; }
              .footer { background: #111111; color: #ffffff; padding: 20px; text-align: center; }
              .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
              .section-title { color: #2c3e50; border-bottom: 2px solid #7cd64b; padding-bottom: 8px; margin-bottom: 20px; }
              .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
              .warning-box { background: #fff3e0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
              th { background: #f8f9fa; font-weight: 600; width: 35%; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Credence Enterprise Accounting Services</h1>
              <p style="margin-top: 5px; opacity: 0.9;">Professional Accounting & VAT Compliance</p>
            </div>
            
            <div class="content">
              <h2 style="color: #2c3e50; margin-top: 0;">Dear ${client.firstName || ''} ${client.lastName || ''},</h2>
              
              <div class="status-box">
                <h3 style="margin-top: 0; color: ${isActive ? '#4caf50' : '#f44336'};">
                  ${isActive ? '✅ ACCOUNT REACTIVATED' : '⚠️ ACCOUNT DEACTIVATED'}
                </h3>
                <p>Your account has been ${isActive ? 'reactivated' : 'deactivated'} by our admin team.</p>
                <p><strong>Date & Time:</strong> ${currentDateTime}</p>
                <p><strong>Admin:</strong> ${req.user.name}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
              
              <div class="client-info">
                <h3 class="section-title">📋 Account Information</h3>
                <table>
                  <tr>
                    <th>Full Name</th>
                    <td>${client.firstName || ''} ${client.lastName || ''}</td>
                  </tr>
                  <tr>
                    <th>Business Name</th>
                    <td>${client.businessName || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>${client.email}</td>
                  </tr>
                  <tr>
                    <th>Phone</th>
                    <td>${client.phone || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <th>Current Status</th>
                    <td>
                      <span style="color: ${isActive ? '#4caf50' : '#f44336'}; font-weight: bold;">
                        ${isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              ${!isActive ? `
              <div class="warning-box">
                <p><strong>⚠️ What this means:</strong></p>
                <ul>
                  <li>You will not be able to access your accounting portal</li>
                  <li>Task assignments and new requests are paused</li>
                  <li>Your data remains safe and secure with us</li>
                </ul>
                <p style="margin-top: 15px;">If you believe this was done in error or have questions, please contact our support team immediately.</p>
              </div>
              ` : `
              <div class="warning-box" style="background: #e8f5e9; border-left-color: #4caf50;">
                <p><strong>✅ Account Reactivated:</strong> You can now access all features of your accounting portal. All services have been restored.</p>
              </div>
              `}
              
              <div class="contact-info">
                <h3 class="section-title">📞 Need Assistance?</h3>
                <p><strong>Email:</strong> support@jladgroup.fi</p>
                <p><strong>Phone Support:</strong> +358413250081</p>
                <p><strong>Business Hours:</strong> Monday to Friday 9am to 3pm (EET/EEST)</p>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Credence Enterprise Accounting Services</strong></p>
              <p>Professional Accounting | VAT Compliance | Business Advisory</p>
              <div class="dev-info">
                Developed by Vapautus Media Private Limited
              </div>
              <p style="font-size: 12px; margin-top: 10px;">
                This is an automated notification email about your account status.<br>
                Please do not reply to this email. For queries, contact support@jladgroup.fi<br>
                Email sent to: ${client.email}
              </p>
            </div>
          </body>
          </html>
        `;

        await sendEmail(client.email, emailSubject, emailHtml);

        logToConsole("INFO", isActive ? "ACTIVATION_EMAIL_SENT" : "DEACTIVATION_EMAIL_SENT", {
          clientId: clientId,
          clientEmail: client.email,
          adminId: req.user.adminId,
          status: isActive ? 'activated' : 'deactivated',
          reason: reason || 'No reason provided'
        });
      }
    } catch (emailError) {
      logToConsole("ERROR", "STATUS_CHANGE_EMAIL_FAILED", {
        error: emailError.message,
        clientId: clientId,
        clientEmail: client.email,
        action: isActive ? 'activation' : 'deactivation'
      });
    }

    res.json({
      success: true,
      message: `Client ${isActive ? 'activated' : 'deactivated'} successfully. Email notification ${client.email ? 'sent' : 'failed - no email address'}.`,
      client: {
        clientId: client.clientId,
        name: client.name,
        email: client.email,
        isActive: client.isActive,
        deactivatedAt: client.deactivatedAt,
        reactivatedAt: client.reactivatedAt
      },
      emailSent: client.email ? true : false
    });

  } catch (error) {
    console.error("Error toggling client status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// ============================================
// UPDATE CLIENT DETAILS WITH EMAIL NOTIFICATION
// ============================================
router.patch("/update-client/:clientId", auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const updateData = req.body;

    const allowedFields = [
      'visaType',
      'hasStrongId',
      'vatPeriod',
      'businessNature',
      'registerTrade',
      'planSelected'
    ];

    const filteredUpdate = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    });

    if (Object.keys(filteredUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    const clientBefore = await Client.findOne({ clientId })
      .select("clientId name email firstName lastName businessName phone visaType hasStrongId vatPeriod businessNature registerTrade planSelected");

    const client = await Client.findOneAndUpdate(
      { clientId },
      { $set: filteredUpdate },
      { new: true }
    ).select("-password -documents -employeeAssignments");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    const changes = [];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined && clientBefore[field] !== updateData[field]) {
        changes.push({
          field,
          oldValue: clientBefore[field],
          newValue: updateData[field]
        });
      }
    });

    try {
      await ActivityLog.create({
        userName: req.user.name,
        role: req.user.role,
        adminId: req.user.adminId,
        clientId: clientId,
        action: "CLIENT_DETAILS_UPDATED",
        details: `Updated client details for: ${client.name} (${clientId}). Fields changed: ${changes.map(c => c.field).join(', ')}`,
        dateTime: new Date(),
        metadata: {
          clientId,
          clientName: client.name,
          changes: changes,
          updatedByAdmin: req.user.name,
          timestamp: new Date()
        }
      });
    } catch (logError) {
      logToConsole("ERROR", "ACTIVITY_LOG_FAILED", {
        error: logError.message,
        adminId: req.user.adminId
      });
    }

    try {
      if (changes.length > 0 && client.email) {
        const fieldDisplayNames = {
          visaType: "Visa Type",
          hasStrongId: "Strong ID Status",
          vatPeriod: "VAT Period",
          businessNature: "Business Nature",
          registerTrade: "Registered Trade",
          planSelected: "Selected Plan"
        };

        const currentDate = new Date().toLocaleDateString('en-IN');
        const currentTime = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const emailSubject = `✅ Client Profile Updated - ${client.businessName || client.name}`;

        let changesTable = '';
        changes.forEach(change => {
          changesTable += `
            <tr>
              <th>${fieldDisplayNames[change.field] || change.field}</th>
              <td><span style="color: #e74c3c; text-decoration: line-through;">${change.oldValue || 'Not set'}</span></td>
              <td><span style="color: #27ae60; font-weight: bold;">→ ${change.newValue || 'Not set'}</span></td>
            </tr>
          `;
        });

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Profile Updated</title>
            <style>
              body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: #111111; color: #ffffff; padding: 30px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; color: #7cd64b; }
              .content { padding: 30px; background: #ffffff; }
              .update-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
              .client-info { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px; }
              .footer { background: #111111; color: #ffffff; padding: 20px; text-align: center; }
              .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
              .section-title { color: #2c3e50; border-bottom: 2px solid #7cd64b; padding-bottom: 8px; margin-bottom: 20px; }
              .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #dee2e6; font-size: 14px; }
              th { background: #f8f9fa; font-weight: 600; width: 35%; }
              .note-box { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196f3; }
              .change-table th { width: 25%; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Credence Enterprise Accounting Services</h1>
              <p style="margin-top: 5px; opacity: 0.9;">Professional Accounting & VAT Compliance</p>
            </div>
            
            <div class="content">
              <h2 style="color: #2c3e50; margin-top: 0;">Dear ${client.firstName} ${client.lastName},</h2>
              
              <div class="update-box">
                <h3 style="margin-top: 0; color: #4caf50;">✅ PROFILE UPDATED SUCCESSFULLY</h3>
                <p>Your client profile has been updated by our admin team. Below are the details of changes made:</p>
                <p><strong>Updated On:</strong> ${currentDate} at ${currentTime} EET/EEST</p>
                <p><strong>Updated By:</strong> ${req.user.name} (Admin)</p>
              </div>
              
              <div class="client-info">
                <h3 class="section-title">📋 Profile Changes Summary</h3>
                <table class="change-table">
                  <tr>
                    <th>Field</th>
                    <th>Previous Value</th>
                    <th>New Value</th>
                  </tr>
                  ${changesTable}
                </table>
              </div>
              
              <div class="client-info">
                <h3 class="section-title">👤 Your Current Profile Information</h3>
                <table>
                  <tr>
                    <th>Full Name</th>
                    <td>${client.firstName} ${client.lastName}</td>
                  </tr>
                  <tr>
                    <th>Business Name</th>
                    <td>${client.businessName || "Not specified"}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>${client.email}</td>
                  </tr>
                  <tr>
                    <th>Phone</th>
                    <td>${client.phone || "Not provided"}</td>
                  </tr>
                  <tr>
                    <th>Visa Type</th>
                    <td>${client.visaType || "Not specified"}</td>
                  </tr>
                  <tr>
                    <th>Selected Plan</th>
                    <td>${client.planSelected || "Not specified"}</td>
                  </tr>
                </table>
              </div>
              
              <div class="note-box">
                <p><strong>📝 Note:</strong> This update was performed by our admin team to ensure your profile information is accurate and up-to-date.</p>
                <p>If you did not request these changes or notice any discrepancies, please contact our support team immediately.</p>
              </div>
              
              <div class="contact-info">
                <h3 class="section-title">📞 Need Assistance?</h3>
                <p><strong>Email:</strong> support@jladgroup.fi</p>
                <p><strong>Phone Support:</strong> +358413250081</p>
                <p><strong>Business Hours:</strong> Monday to Fri 9am to 3pm (EET/EEST)</p>
              </div>
              
              <p style="margin-top: 25px; font-size: 14px; color: #666;">
                <strong>Important:</strong> Keeping your profile information updated ensures we provide you with the best accounting services and VAT compliance support.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Credence Enterprise Accounting Services</strong></p>
              <p>Professional Accounting | VAT Compliance | Business Advisory</p>
              <div class="dev-info">
                Developed by Vapautus Media Private Limited
              </div>
              <p style="font-size: 12px; margin-top: 10px;">
                This is an automated notification email sent to inform you about profile changes.<br>
                Please do not reply to this email. For queries, contact support@jladgroup.fi<br>
                Email sent to: ${client.email}
              </p>
            </div>
          </body>
          </html>
        `;

        await sendEmail(client.email, emailSubject, emailHtml);

        logToConsole("INFO", "CLIENT_UPDATE_EMAIL_SENT", {
          clientId: clientId,
          clientEmail: client.email,
          adminId: req.user.adminId,
          fieldsUpdated: changes.map(c => c.field)
        });
      }
    } catch (emailError) {
      logToConsole("ERROR", "CLIENT_UPDATE_EMAIL_FAILED", {
        error: emailError.message,
        clientId: clientId,
        clientEmail: client.email
      });
    }

    res.json({
      success: true,
      message: "Client updated successfully",
      client,
      changes: changes.length > 0 ? changes : null,
      emailSent: changes.length > 0 && client.email ? true : false
    });

  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// ============================================
// GET SINGLE CLIENT DETAILS
// ============================================
router.get("/client/:clientId", auth, async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findOne({ clientId })
      .select("-password -documents -employeeAssignments");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    try {
      await ActivityLog.create({
        userName: req.user.name,
        role: req.user.role,
        adminId: req.user.adminId,
        clientId: clientId,
        action: "CLIENT_DETAILS_VIEWED",
        details: `Viewed client details for: ${client.name} (${clientId})`,
        dateTime: new Date(),
        metadata: {
          clientId,
          clientName: client.name,
          viewedByAdmin: req.user.name
        }
      });
    } catch (logError) {
      logToConsole("ERROR", "ACTIVITY_LOG_FAILED", {
        error: logError.message,
        adminId: req.user.adminId
      });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error("Error fetching client details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// ============================================
// ADMIN: GET ALL REQUESTS (FROM NEW COLLECTION)
// ============================================
router.get('/all-requests', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [];

    pipeline.push({
      $unwind: '$requests'
    });

    if (status && status !== 'all') {
      pipeline.push({
        $match: { 'requests.status': status }
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { clientName: { $regex: search, $options: 'i' } },
            { clientEmail: { $regex: search, $options: 'i' } },
            { 'requests.requestId': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push({
      $sort: { 'requests.requestedAt': -1 }
    });

    const countPipeline = [...pipeline];
    const countResult = await FinancialStatementRequest.aggregate([
      ...countPipeline,
      { $count: 'total' }
    ]);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    pipeline.push({
      $project: {
        _id: 0,
        requestId: '$requests.requestId',
        clientId: '$clientId',
        clientName: '$clientName',
        clientEmail: '$clientEmail',
        fromDate: '$requests.fromDate',
        toDate: '$requests.toDate',
        dateRangeDisplay: '$requests.dateRangeDisplay',
        status: '$requests.status',
        requestedAt: '$requests.requestedAt',
        isPaid: '$requests.isPaid',
        year: '$requests.year',
        adminNotes: '$requests.adminNotes',
        sentDate: '$requests.sentDate',
        downloadUrl: '$requests.downloadUrl',
        processedBy: '$requests.processedBy',
        processedAt: '$requests.processedAt',
        emailSentToAdmin: '$requests.emailSentToAdmin',
        emailSentToClient: '$requests.emailSentToClient',
        statementSentEmail: '$requests.statementSentEmail',
        // ===== NEW: Employee Assignment Fields =====
        assignedEmployeeId: '$requests.assignedEmployeeId',
        assignedEmployeeName: '$requests.assignedEmployeeName',
        assignedAt: '$requests.assignedAt',
        assignedBy: '$requests.assignedBy',
        employeeNotes: '$requests.employeeNotes',
        sentByEmployeeId: '$requests.sentByEmployeeId',
        sentByEmployeeName: '$requests.sentByEmployeeName',
        sentToClientAt: '$requests.sentToClientAt'
      }
    });

    const requests = await FinancialStatementRequest.aggregate(pipeline);

    const statusCountsResult = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $group: { _id: '$requests.status', count: { $sum: 1 } } }
    ]);

    const counts = {
      pending: 0,
      in_progress: 0,
      approved: 0,
      sent: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      all: total
    };

    statusCountsResult.forEach(item => {
      if (item._id in counts) {
        counts[item._id] = item.count;
      }
    });

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      },
      statusCounts: counts
    });

  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

// ============================================
// ADMIN: GET SINGLE REQUEST DETAILS
// ============================================
router.get('/request/:requestId', auth, async (req, res) => {
  try {
    const result = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $match: { 'requests.requestId': req.params.requestId } },
      {
        $project: {
          _id: 0,
          requestId: '$requests.requestId',
          clientId: '$clientId',
          clientName: '$clientName',
          clientEmail: '$clientEmail',
          fromDate: '$requests.fromDate',
          toDate: '$requests.toDate',
          dateRangeDisplay: '$requests.dateRangeDisplay',
          status: '$requests.status',
          requestedAt: '$requests.requestedAt',
          isPaid: '$requests.isPaid',
          year: '$requests.year',
          adminNotes: '$requests.adminNotes',
          sentDate: '$requests.sentDate',
          downloadUrl: '$requests.downloadUrl',
          processedBy: '$requests.processedBy',
          processedAt: '$requests.processedAt',
          emailSentToAdmin: '$requests.emailSentToAdmin',
          emailSentToClient: '$requests.emailSentToClient',
          statementSentEmail: '$requests.statementSentEmail',
          // ===== NEW: Employee Assignment Fields =====
          assignedEmployeeId: '$requests.assignedEmployeeId',
          assignedEmployeeName: '$requests.assignedEmployeeName',
          assignedAt: '$requests.assignedAt',
          assignedBy: '$requests.assignedBy',
          employeeNotes: '$requests.employeeNotes',
          sentByEmployeeId: '$requests.sentByEmployeeId',
          sentByEmployeeName: '$requests.sentByEmployeeName',
          sentToClientAt: '$requests.sentToClientAt'
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('Error fetching request details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request details'
    });
  }
});

// ============================================
// ADMIN: APPROVE REQUEST (UPDATED - Status: pending → in_progress)
// ============================================
router.put('/approve/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    const clientDoc = await FinancialStatementRequest.findOne({
      'requests.requestId': requestId
    });

    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const requestIndex = clientDoc.requests.findIndex(r => r.requestId === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = clientDoc.requests[requestIndex];

    if (request.status === 'in_progress' || request.status === 'sent' || request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`
      });
    }

    if (request.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve a rejected request. Client needs to request again.'
      });
    }

    // ========== UPDATE: Status to "in_progress" ==========
    request.status = 'in_progress';
    request.processedAt = new Date();
    request.processedBy = {
      adminId: req.user.adminId,
      adminName: req.user.name
    };

    if (adminNotes && adminNotes.trim() !== '') {
      request.adminNotes = adminNotes;
    }

    await clientDoc.save();

    // ========== SEND EMAIL TO CLIENT: "Approved & In Progress" ==========
    const clientEmail = clientDoc.clientEmail;
    const clientName = clientDoc.clientName;
    const dateRangeDisplay = request.dateRangeDisplay || 'Financial Statements';

    let notesHtml = '';
    if (adminNotes && adminNotes.trim() !== '') {
      notesHtml = `
        <div style="background: #fff8e1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa726;">
          <h4 style="margin-top: 0; color: #e65100;">📝 Admin Notes:</h4>
          <p style="font-size: 16px; color: #333; white-space: pre-wrap; margin: 10px 0;">${adminNotes}</p>
        </div>
      `;
    }

    const clientSubject = `✅ Financial Statement Request Approved & In Progress`;
    const clientHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Approved - In Progress</title>
        <style>
          body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #111111; color: #ffffff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; color: #7cd64b; }
          .content { padding: 30px; background: #ffffff; }
          .success-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
          .info-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px; }
          .footer { background: #111111; color: #ffffff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
          .section-title { color: #2c3e50; border-bottom: 2px solid #7cd64b; padding-bottom: 8px; margin-bottom: 20px; }
          .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
          th { background: #f8f9fa; font-weight: 600; width: 35%; }
          .progress-box { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
          .note-box { background: #fff8e1; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffa726; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Credence Enterprise Accounting Services</h1>
          <p style="margin-top: 5px; opacity: 0.9;">Professional Accounting & VAT Compliance</p>
        </div>
        
        <div class="content">
          <h2 style="color: #2c3e50; margin-top: 0;">Dear ${clientName},</h2>
          
          <div class="success-box">
            <h3 style="margin-top: 0; color: #4caf50;">✅ REQUEST APPROVED & IN PROGRESS</h3>
            <p>Your financial statement request has been <strong>approved</strong> by our admin team and is now being processed.</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Period:</strong> ${dateRangeDisplay}</p>
            <p><strong>Approved On:</strong> ${new Date().toLocaleString('en-IN')}</p>
            <p><strong>Status:</strong> <span style="color: #2196f3; font-weight: bold;">🔄 IN PROGRESS</span></p>
          </div>
          
          <div class="info-box">
            <h3 class="section-title">📋 Request Details</h3>
            <table>
              <tr>
                <th>Request ID</th>
                <td>${requestId}</td>
              </tr>
              <tr>
                <th>Date Range</th>
                <td>${dateRangeDisplay}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td><span style="color: #2196f3; font-weight: bold;">🔄 In Progress</span></td>
              </tr>
              <tr>
                <th>Payment Status</th>
                <td>${request.isPaid ? '💰 Paid Request' : '✅ Free Request'}</td>
              </tr>
            </table>
          </div>

          ${notesHtml}

          <div class="progress-box">
            <p><strong>💡 What happens next:</strong></p>
            <ul>
              <li>Our team is now preparing your financial statements</li>
              <li>You will receive a download link once completed</li>
              <li>We will notify you as soon as your statements are ready</li>
            </ul>
          </div>
          
          <div class="contact-info">
            <h3 class="section-title">📞 Need Assistance?</h3>
            <p><strong>Email:</strong> support@jladgroup.fi</p>
            <p><strong>Phone Support:</strong> +358413250081</p>
            <p><strong>Business Hours:</strong> Monday to Friday 9am to 3pm (EET/EEST)</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Credence Enterprise Accounting Services</strong></p>
          <p>Professional Accounting | VAT Compliance | Business Advisory</p>
          <div class="dev-info">
            Developed by Vapautus Media Private Limited
          </div>
          <p style="font-size: 12px; margin-top: 10px;">
            This is an automated notification about your financial statements request.<br>
            Please do not reply to this email. For queries, contact support@jladgroup.fi
          </p>
        </div>
      </body>
      </html>
    `;

    await sendEmail(clientEmail, clientSubject, clientHtml);

    request.emailSentToClient = true;
    await clientDoc.save();

    try {
      await ActivityLog.create({
        userName: req.user.name,
        role: req.user.role,
        adminId: req.user.adminId,
        clientId: clientDoc.clientId,
        clientName: clientDoc.clientName,
        action: "FINANCIAL_STATEMENT_APPROVED",
        details: `Approved financial statement request ${requestId} for ${dateRangeDisplay} - Status: In Progress`,
        dateTime: new Date(),
        metadata: {
          requestId: requestId,
          year: request.year,
          isPaid: request.isPaid,
          clientEmail: clientDoc.clientEmail,
          adminNotes: adminNotes || null,
          newStatus: 'in_progress'
        }
      });
    } catch (logError) {
      console.error('Activity log error:', logError);
    }

    res.json({
      success: true,
      message: 'Request approved successfully. Client notified that work is in progress.',
      data: request
    });

  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request'
    });
  }
});

// ============================================
// ADMIN: REJECT REQUEST (NEW - WITH NOTES IN EMAIL)
// ============================================
router.put('/reject/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    const clientDoc = await FinancialStatementRequest.findOne({
      'requests.requestId': requestId
    });

    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const requestIndex = clientDoc.requests.findIndex(r => r.requestId === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = clientDoc.requests[requestIndex];

    if (request.status === 'approved' || request.status === 'sent' || request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject. Request is already ${request.status}`
      });
    }

    if (request.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Request already rejected'
      });
    }

    // Update to rejected
    request.status = 'rejected';
    request.processedAt = new Date();
    request.processedBy = {
      adminId: req.user.adminId,
      adminName: req.user.name
    };

    if (adminNotes && adminNotes.trim() !== '') {
      request.adminNotes = adminNotes;
    }

    await clientDoc.save();

    // Send rejection email to client with notes
    const clientEmail = clientDoc.clientEmail;
    const clientName = clientDoc.clientName;
    const dateRangeDisplay = request.dateRangeDisplay || 'Financial Statements';

    let notesHtml = '';
    if (adminNotes && adminNotes.trim() !== '') {
      notesHtml = `
        <div style="background: #fff8e1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa726;">
          <h4 style="margin-top: 0; color: #e65100;">📝 Admin Notes:</h4>
          <p style="font-size: 16px; color: #333; white-space: pre-wrap; margin: 10px 0;">${adminNotes}</p>
        </div>
      `;
    }

    const clientSubject = `❌ Financial Statements Request Rejected - ${dateRangeDisplay}`;
    const clientHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Financial Statements Rejected</title>
        <style>
          body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #111111; color: #ffffff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; color: #7cd64b; }
          .content { padding: 30px; background: #ffffff; }
          .reject-box { background: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
          .info-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px; }
          .footer { background: #111111; color: #ffffff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
          .section-title { color: #2c3e50; border-bottom: 2px solid #7cd64b; padding-bottom: 8px; margin-bottom: 20px; }
          .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
          th { background: #f8f9fa; font-weight: 600; width: 35%; }
          .note-box { background: #fff8e1; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffa726; }
          .retry-box { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Credence Enterprise Accounting Services</h1>
          <p style="margin-top: 5px; opacity: 0.9;">Professional Accounting & VAT Compliance</p>
        </div>
        
        <div class="content">
          <h2 style="color: #2c3e50; margin-top: 0;">Dear ${clientName},</h2>
          
          <div class="reject-box">
            <h3 style="margin-top: 0; color: #f44336;">❌ FINANCIAL STATEMENTS REQUEST REJECTED</h3>
            <p>We regret to inform you that your financial statement request has been <strong>rejected</strong> by our admin team.</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Period:</strong> ${dateRangeDisplay}</p>
            <p><strong>Rejected On:</strong> ${new Date().toLocaleString('en-IN')}</p>
            <p><strong>Reviewed By:</strong> ${req.user.name}</p>
          </div>
          
          <div class="info-box">
            <h3 class="section-title">📋 Request Details</h3>
            <table>
              <tr>
                <th>Request ID</th>
                <td>${requestId}</td>
              </tr>
              <tr>
                <th>Date Range</th>
                <td>${dateRangeDisplay}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td><span style="color: #f44336; font-weight: bold;">❌ Rejected</span></td>
              </tr>
              <tr>
                <th>Payment Status</th>
                <td>${request.isPaid ? '💰 Paid Request' : '✅ Free Request'}</td>
              </tr>
            </table>
          </div>

          ${notesHtml}

          <div class="retry-box">
            <p><strong>🔄 What You Can Do:</strong></p>
            <ul>
              <li>Review the admin notes above for rejection reason</li>
              <li>Make necessary corrections or provide additional information</li>
              <li>Submit a new request with updated details</li>
              <li>Contact us if you need clarification</li>
            </ul>
          </div>
          
          <div class="contact-info">
            <h3 class="section-title">📞 Need Assistance?</h3>
            <p><strong>Email:</strong> support@jladgroup.fi</p>
            <p><strong>Phone Support:</strong> +358413250081</p>
            <p><strong>Business Hours:</strong> Monday to Friday 9am to 3pm (EET/EEST)</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Credence Enterprise Accounting Services</strong></p>
          <p>Professional Accounting | VAT Compliance | Business Advisory</p>
          <div class="dev-info">
            Developed by Vapautus Media Private Limited
          </div>
          <p style="font-size: 12px; margin-top: 10px;">
            This is an automated notification about your financial statements request.<br>
            Please do not reply to this email. For queries, contact support@jladgroup.fi
          </p>
        </div>
      </body>
      </html>
    `;

    await sendEmail(clientEmail, clientSubject, clientHtml);

    request.emailSentToClient = true;
    await clientDoc.save();

    try {
      await ActivityLog.create({
        userName: req.user.name,
        role: req.user.role,
        adminId: req.user.adminId,
        clientId: clientDoc.clientId,
        clientName: clientDoc.clientName,
        action: "FINANCIAL_STATEMENT_REJECTED",
        details: `Rejected financial statement request ${requestId} for ${dateRangeDisplay}`,
        dateTime: new Date(),
        metadata: {
          requestId: requestId,
          year: request.year,
          isPaid: request.isPaid,
          clientEmail: clientDoc.clientEmail,
          adminNotes: adminNotes || null
        }
      });
    } catch (logError) {
      console.error('Activity log error:', logError);
    }

    res.json({
      success: true,
      message: 'Request rejected successfully. Email sent to client.',
      data: request
    });

  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request'
    });
  }
});

// ============================================
// ADMIN: UPDATE REQUEST STATUS
// ============================================
router.put('/update-status/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'approved', 'sent', 'completed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const clientDoc = await FinancialStatementRequest.findOne({
      'requests.requestId': requestId
    });

    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const requestIndex = clientDoc.requests.findIndex(r => r.requestId === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = clientDoc.requests[requestIndex];

    request.status = status;

    if (status === 'sent') {
      request.sentDate = new Date();
    }

    if (status === 'approved' || status === 'sent' || status === 'rejected') {
      request.processedAt = new Date();
      request.processedBy = {
        adminId: req.user.adminId,
        adminName: req.user.name
      };
    }

    if (adminNotes) {
      request.adminNotes = adminNotes;
    }

    await clientDoc.save();

    try {
      await ActivityLog.create({
        userName: req.user.name,
        role: req.user.role,
        adminId: req.user.adminId,
        clientId: clientDoc.clientId,
        clientName: clientDoc.clientName,
        action: `FINANCIAL_STATEMENT_${status.toUpperCase()}`,
        details: `Changed status to ${status} for request ${requestId}`,
        dateTime: new Date(),
        metadata: {
          requestId: requestId,
          newStatus: status,
          adminNotes: adminNotes || null
        }
      });
    } catch (logError) {
      console.error('Activity log error:', logError);
    }

    res.json({
      success: true,
      message: `Status updated to ${status} successfully`,
      data: request
    });

  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

// ============================================
// ADMIN: GET STATISTICS/DASHBOARD COUNTS
// ============================================
router.get('/statistics', auth, async (req, res) => {
  try {
    const allRequests = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    const pendingRequests = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $match: { 'requests.status': 'pending' } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const approvedRequests = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $match: { 'requests.status': 'approved' } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const sentRequests = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $match: { 'requests.status': 'sent' } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const completedRequests = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $match: { 'requests.status': 'completed' } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const rejectedRequests = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $match: { 'requests.status': 'rejected' } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRequests = await FinancialStatementRequest.aggregate([
      { $unwind: '$requests' },
      { $match: { 'requests.requestedAt': { $gte: sevenDaysAgo } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const total = allRequests.length > 0 ? allRequests[0].total : 0;
    const pending = pendingRequests.length > 0 ? pendingRequests[0].count : 0;
    const approved = approvedRequests.length > 0 ? approvedRequests[0].count : 0;
    const sent = sentRequests.length > 0 ? sentRequests[0].count : 0;
    const completed = completedRequests.length > 0 ? completedRequests[0].count : 0;
    const rejected = rejectedRequests.length > 0 ? rejectedRequests[0].count : 0;
    const recent = recentRequests.length > 0 ? recentRequests[0].count : 0;

    res.json({
      success: true,
      data: {
        total: total,
        pending: pending,
        approved: approved,
        sent: sent,
        completed: completed,
        rejected: rejected,
        recent_7_days: recent
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// ============================================
// HELPER FUNCTION: Get months between two dates
// ============================================
function getMonthsInRange(startDate, endDate) {
  const months = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const year = current.getFullYear();
    const month = current.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

    const isPartial =
      (current.getTime() === startDate.getTime() && startDate > monthStart) ||
      (monthEnd > endDate);

    const actualStart = isPartial ?
      new Date(Math.max(monthStart.getTime(), startDate.getTime())) :
      new Date(monthStart);

    const actualEnd = isPartial ?
      new Date(Math.min(monthEnd.getTime(), endDate.getTime())) :
      new Date(monthEnd);

    months.push({
      year,
      month,
      monthName: monthStart.toLocaleString('default', { month: 'long' }),
      startOfMonth: monthStart,
      endOfMonth: monthEnd,
      isPartial,
      actualStartDate: actualStart,
      actualEndDate: actualEnd
    });

    current.setMonth(current.getMonth() + 1);
    current.setDate(1);
  }

  return months;
}

// ============================================
// ADMIN: TASK INFO - FULLY OPTIMIZED VERSION
// ============================================
router.get("/task-info", auth, async (req, res) => {
  try {
    const { filterType, fromDate, toDate } = req.query;

    let startDate, endDate;
    const today = new Date();

    if (filterType === 'thisMonth') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    }
    else if (filterType === 'lastMonth') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
    }
    else if (filterType === 'custom' && fromDate && toDate) {
      startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
    }
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid date filter parameters"
      });
    }

    console.log("🔍 Fetching task info from:", startDate, "to", endDate);

    const clients = await Client.find({ isActive: true })
      .select("clientId name email businessName employeeAssignments documents firstName lastName")
      .lean();

    console.log(`🔍 Found ${clients.length} total active clients`);

    if (clients.length === 0) {
      return res.json({
        success: true,
        data: [],
        filterInfo: { type: filterType, from: startDate, to: endDate }
      });
    }

    const monthsInRange = getMonthsInRange(startDate, endDate);
    const clientIds = clients.map(c => c.clientId);

    let paymentMap = new Map();

    try {
      const ClientMonthlyData = require("../models/ClientMonthlyData");

      const allMonthlyData = await ClientMonthlyData.find({
        clientId: { $in: clientIds }
      }).lean();

      for (const record of allMonthlyData) {
        if (record.months && Array.isArray(record.months)) {
          for (const month of record.months) {
            if (month.paymentStatus !== undefined) {
              let paymentStatusValue = month.paymentStatus;
              let normalizedStatus = 'pending';

              if (typeof paymentStatusValue === 'boolean') {
                normalizedStatus = paymentStatusValue === true ? 'paid' : 'pending';
              } else if (typeof paymentStatusValue === 'string') {
                normalizedStatus = paymentStatusValue;
              }

              const key = `${record.clientId}-${month.year}-${month.month}`;
              paymentMap.set(key, {
                status: normalizedStatus,
                originalStatus: paymentStatusValue,
                updatedAt: month.paymentUpdatedAt || null,
                updatedBy: month.paymentUpdatedBy || null,
                updatedByName: month.paymentUpdatedByName || null,
                notes: month.paymentNotes || null,
                source: 'new'
              });
            }
          }
        }
      }

      const clientsWithDocs = await Client.find(
        { clientId: { $in: clientIds } },
        { clientId: 1, documents: 1 }
      ).lean();

      for (const client of clientsWithDocs) {
        if (client.documents && typeof client.documents === 'object') {
          for (const [yearKey, yearData] of Object.entries(client.documents)) {
            if (yearData && typeof yearData === 'object') {
              for (const [monthKey, monthData] of Object.entries(yearData)) {
                if (monthData && monthData.paymentStatus !== undefined) {
                  const key = `${client.clientId}-${yearKey}-${monthKey}`;
                  if (!paymentMap.has(key)) {
                    let paymentStatusValue = monthData.paymentStatus;
                    let normalizedStatus = 'pending';

                    if (typeof paymentStatusValue === 'boolean') {
                      normalizedStatus = paymentStatusValue === true ? 'paid' : 'pending';
                    } else if (typeof paymentStatusValue === 'string') {
                      normalizedStatus = paymentStatusValue;
                    }

                    paymentMap.set(key, {
                      status: normalizedStatus,
                      originalStatus: paymentStatusValue,
                      updatedAt: monthData.paymentUpdatedAt || null,
                      updatedBy: monthData.paymentUpdatedBy || null,
                      updatedByName: monthData.paymentUpdatedByName || null,
                      notes: monthData.paymentNotes || null,
                      source: 'old'
                    });
                  }
                }
              }
            }
          }
        }
      }

      console.log(`🔍 Loaded ${paymentMap.size} payment records from batch query`);
    } catch (err) {
      console.log("Error loading payment data:", err.message);
    }

    const taskData = [];

    for (const client of clients) {
      const assignments = client.employeeAssignments || [];

      const assignmentsInRange = assignments.filter(assignment => {
        if (!assignment.assignedAt) return false;
        if (assignment.isRemoved) return false;
        const assignDate = new Date(assignment.assignedAt);
        return assignDate >= startDate && assignDate <= endDate;
      });

      const totalTasks = assignmentsInRange.length;
      const pendingTasks = assignmentsInRange.filter(a => !a.accountingDone).length;
      const completedTasks = assignmentsInRange.filter(a => a.accountingDone).length;

      let paymentSummary = {
        totalMonths: 0,
        paidMonths: 0,
        pendingMonths: 0,
        notCreditedMonths: 0,
        months: []
      };

      for (const monthInfo of monthsInRange) {
        const year = monthInfo.year;
        const monthNum = monthInfo.month + 1;

        const paymentKey = `${client.clientId}-${year}-${monthNum}`;
        const paymentFromMap = paymentMap.get(paymentKey);

        let paymentStatus = 'pending';
        let paymentDetails = {
          status: 'pending',
          updatedAt: null,
          updatedBy: null,
          updatedByName: null,
          notes: null,
          source: null
        };

        if (paymentFromMap) {
          paymentStatus = paymentFromMap.status;
          paymentDetails = paymentFromMap;
        }

        paymentSummary.months.push({
          year: monthInfo.year,
          month: monthNum,
          monthName: monthInfo.monthName,
          fromDate: monthInfo.actualStartDate,
          toDate: monthInfo.actualEndDate,
          isPartial: monthInfo.isPartial,
          payment: paymentDetails
        });

        if (paymentStatus === 'paid') {
          paymentSummary.paidMonths++;
        } else if (paymentStatus === 'pending') {
          paymentSummary.pendingMonths++;
        } else if (paymentStatus === 'not_credited') {
          paymentSummary.notCreditedMonths++;
        }
      }

      paymentSummary.totalMonths = paymentSummary.months.length;

      let paymentDisplayText = 'No Data';
      if (paymentSummary.totalMonths > 0) {
        if (paymentSummary.paidMonths === paymentSummary.totalMonths) {
          paymentDisplayText = 'All Paid';
        } else if (paymentSummary.pendingMonths === paymentSummary.totalMonths) {
          paymentDisplayText = 'All Pending';
        } else if (paymentSummary.notCreditedMonths === paymentSummary.totalMonths) {
          paymentDisplayText = 'All Not Credited';
        } else {
          let parts = [];
          if (paymentSummary.paidMonths > 0) parts.push(`${paymentSummary.paidMonths} Paid`);
          if (paymentSummary.pendingMonths > 0) parts.push(`${paymentSummary.pendingMonths} Pending`);
          if (paymentSummary.notCreditedMonths > 0) parts.push(`${paymentSummary.notCreditedMonths} Not Credited`);
          paymentDisplayText = parts.join(', ');
        }
      }

      const monthlyBreakdown = [];

      for (const monthInfo of monthsInRange) {
        const year = monthInfo.year;
        const monthNum = monthInfo.month + 1;

        const monthTasks = assignments.filter(assignment => {
          return assignment.year === year &&
            assignment.month === monthNum &&
            !assignment.isRemoved;
        }).map(task => ({
          taskName: task.task || 'Task',
          employeeName: task.employeeName || 'Not Assigned',
          employeeId: task.employeeId,
          assignedAt: task.assignedAt,
          accountingDone: task.accountingDone || false,
          completedAt: task.accountingDoneAt || null,
          completedBy: task.accountingDoneBy || null
        }));

        const monthPayment = paymentSummary.months.find(
          m => m.year === year && m.month === monthNum
        )?.payment || { status: 'pending' };

        monthlyBreakdown.push({
          month: monthInfo.monthName,
          year: year,
          monthNum: monthNum,
          fromDate: monthInfo.actualStartDate,
          toDate: monthInfo.actualEndDate,
          isPartial: monthInfo.isPartial,
          tasks: monthTasks,
          payment: monthPayment
        });
      }

      monthlyBreakdown.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthNum - a.monthNum;
      });

      taskData.push({
        clientId: client.clientId,
        clientName: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim(),
        email: client.email,
        businessName: client.businessName || 'N/A',
        tasksSummary: {
          total: totalTasks,
          assigned: totalTasks,
          pending: pendingTasks,
          completed: completedTasks
        },
        paymentSummary: {
          totalMonths: paymentSummary.totalMonths,
          paidMonths: paymentSummary.paidMonths,
          pendingMonths: paymentSummary.pendingMonths,
          notCreditedMonths: paymentSummary.notCreditedMonths,
          displayText: paymentDisplayText,
          months: paymentSummary.months
        },
        monthlyBreakdown: monthlyBreakdown,
        dateRange: {
          from: startDate,
          to: endDate,
          filterType
        }
      });
    }

    taskData.sort((a, b) => a.clientName.localeCompare(b.clientName));

    console.log(`✅ Task info processed successfully for ${taskData.length} clients (all active clients)`);
    console.log(`   📊 Payment summary: paid=${taskData.reduce((s, c) => s + c.paymentSummary.paidMonths, 0)}, pending=${taskData.reduce((s, c) => s + c.paymentSummary.pendingMonths, 0)}, notCredited=${taskData.reduce((s, c) => s + c.paymentSummary.notCreditedMonths, 0)}`);

    res.json({
      success: true,
      data: taskData,
      filterInfo: {
        type: filterType,
        from: startDate,
        to: endDate
      },
      performance: {
        totalClients: taskData.length,
        clientsWithTasks: taskData.filter(c => c.tasksSummary.total > 0).length,
        monthsProcessed: monthsInRange.length,
        paymentRecordsLoaded: paymentMap.size
      }
    });

  } catch (error) {
    console.error("Error fetching task info:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching task information",
      error: error.message
    });
  }
});


// ============================================
// ADMIN: ASSIGN EMPLOYEE TO REQUEST
// ============================================
router.put('/assign-employee/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { employeeId, employeeName } = req.body;

    // ===== VALIDATION =====
    if (!employeeId || !employeeName) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and Name are required'
      });
    }

    // ===== FIND THE REQUEST =====
    const clientDoc = await FinancialStatementRequest.findOne({
      'requests.requestId': requestId
    });

    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // ===== FIND THE SPECIFIC REQUEST =====
    const requestIndex = clientDoc.requests.findIndex(r => r.requestId === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = clientDoc.requests[requestIndex];

    // ===== CHECK STATUS =====
    if (request.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign employee. Request status is "${request.status}". Only "in_progress" requests can be assigned.`
      });
    }

    // ===== CHECK IF ALREADY ASSIGNED =====
    if (request.assignedEmployeeId) {
      return res.status(400).json({
        success: false,
        message: `Employee already assigned to this request: ${request.assignedEmployeeName} (${request.assignedEmployeeId})`
      });
    }

    // ===== VERIFY EMPLOYEE EXISTS AND IS ACTIVE =====
    const Employee = require('../models/Employee');
    const employee = await Employee.findOne({
      employeeId: employeeId,
      isActive: true
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or is not active'
      });
    }

    // ===== ASSIGN EMPLOYEE =====
    request.assignedEmployeeId = employeeId;
    request.assignedEmployeeName = employeeName;
    request.assignedAt = new Date();
    request.assignedBy = {
      adminId: req.user.adminId,
      adminName: req.user.name
    };

    await clientDoc.save();

    // ===== SEND EMAIL TO EMPLOYEE =====
    try {
      const employeeEmail = employee.email;
      const clientName = clientDoc.clientName;
      const dateRangeDisplay = request.dateRangeDisplay || 'Financial Statements';

      const emailSubject = `📋 New Financial Statement Request Assigned to You`;
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Request Assigned</title>
          <style>
            body { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #111111; color: #ffffff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; color: #7cd64b; }
            .content { padding: 30px; background: #ffffff; }
            .info-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 25px 0; border-radius: 8px; }
            .footer { background: #111111; color: #ffffff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
            .section-title { color: #2c3e50; border-bottom: 2px solid #7cd64b; padding-bottom: 8px; margin-bottom: 20px; }
            .dev-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
            th { background: #f8f9fa; font-weight: 600; width: 35%; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #e3f2fd; color: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Credence Enterprise Accounting Services</h1>
            <p style="margin-top: 5px; opacity: 0.9;">Professional Accounting & VAT Compliance</p>
          </div>
          
          <div class="content">
            <h2 style="color: #2c3e50; margin-top: 0;">Hello ${employeeName},</h2>
            
            <p>You have been assigned a new financial statement request.</p>
            
            <div class="info-box">
              <h3 class="section-title">📋 Request Details</h3>
              <table>
                <tr>
                  <th>Request ID</th>
                  <td>${requestId}</td>
                </tr>
                <tr>
                  <th>Client Name</th>
                  <td>${clientName}</td>
                </tr>
                <tr>
                  <th>Client Email</th>
                  <td>${clientDoc.clientEmail}</td>
                </tr>
                <tr>
                  <th>Period</th>
                  <td>${dateRangeDisplay}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td><span class="status-badge">🔄 In Progress</span></td>
                </tr>
                <tr>
                  <th>Assigned By</th>
                  <td>${req.user.name}</td>
                </tr>
                <tr>
                  <th>Assigned On</th>
                  <td>${new Date().toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>

            ${request.adminNotes ? `
            <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa726;">
              <h4 style="margin-top: 0; color: #e65100;">📝 Admin Notes:</h4>
              <p style="margin: 10px 0;">${request.adminNotes}</p>
            </div>
            ` : ''}

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <p><strong>💡 Next Steps:</strong></p>
              <ul>
                <li>Prepare the financial statements for this client</li>
                <li>Once ready, send the statements to the client</li>
                <li>Mark the request as "Sent" after sending</li>
              </ul>
            </div>
            
            <div class="contact-info">
              <h3 class="section-title">📞 Need Assistance?</h3>
              <p><strong>Email:</strong> support@jladgroup.fi</p>
              <p><strong>Phone Support:</strong> +358413250081</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Credence Enterprise Accounting Services</strong></p>
            <p>Professional Accounting | VAT Compliance | Business Advisory</p>
            <div class="dev-info">
              Developed by Vapautus Media Private Limited
            </div>
            <p style="font-size: 12px; margin-top: 10px;">
              This is an automated notification about your assigned request.<br>
              Please do not reply to this email. For queries, contact support@jladgroup.fi
            </p>
          </div>
        </body>
        </html>
      `;

      await sendEmail(employeeEmail, emailSubject, emailHtml);

      logToConsole("INFO", "ASSIGN_EMPLOYEE_EMAIL_SENT", {
        employeeId,
        employeeEmail,
        requestId,
        adminId: req.user.adminId
      });
    } catch (emailError) {
      logToConsole("ERROR", "ASSIGN_EMPLOYEE_EMAIL_FAILED", {
        error: emailError.message,
        employeeId,
        requestId
      });
    }

    // ===== ACTIVITY LOG =====
    try {
      await ActivityLog.create({
        userName: req.user.name,
        role: req.user.role,
        adminId: req.user.adminId,
        clientId: clientDoc.clientId,
        clientName: clientDoc.clientName,
        action: "EMPLOYEE_ASSIGNED_TO_REQUEST",
        details: `Assigned employee "${employeeName}" (${employeeId}) to request ${requestId}`,
        dateTime: new Date(),
        metadata: {
          requestId: requestId,
          employeeId: employeeId,
          employeeName: employeeName,
          assignedBy: req.user.name,
          status: request.status
        }
      });
    } catch (logError) {
      console.error('Activity log error:', logError);
    }

    // ===== RESPONSE =====
    res.json({
      success: true,
      message: `Employee "${employeeName}" assigned successfully to request ${requestId}`,
      data: {
        requestId: requestId,
        assignedEmployeeId: request.assignedEmployeeId,
        assignedEmployeeName: request.assignedEmployeeName,
        assignedAt: request.assignedAt,
        assignedBy: request.assignedBy,
        status: request.status
      }
    });

  } catch (error) {
    console.error('Error assigning employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;