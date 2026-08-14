const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const Client = require("../models/Client");
const ClientMonthlyData = require("../models/ClientMonthlyData");
const ActivityLog = require("../models/ActivityLog");

// ===============================
// CONSOLE LOGGING UTILITY
// ===============================
const logToConsole = (type, operation, data) => {
  const timestamp = new Date().toLocaleString("en-IN");
  const colors = {
    INFO: '\x1b[36m',
    SUCCESS: '\x1b[32m',
    WARN: '\x1b[33m',
    ERROR: '\x1b[31m',
    DEBUG: '\x1b[35m',
    RESET: '\x1b[0m'
  };
  const color = colors[type] || colors.RESET;
  console.log(`${color}[${timestamp}] ${type}: ${operation}${colors.RESET}`, data);
};

// ===============================
// HELPER: GET MONTH DATA FROM BOTH COLLECTIONS
// ===============================
const getMonthDataFromBoth = async (clientId, year, month) => {
  const numericYear = parseInt(year);
  const numericMonth = parseInt(month);

  try {
    const newDoc = await ClientMonthlyData.findOne({ clientId });
    if (newDoc && newDoc.months) {
      const foundMonth = newDoc.months.find(m => m.year === numericYear && m.month === numericMonth);
      if (foundMonth) {
        return {
          data: foundMonth,
          source: 'new',
          doc: newDoc,
          monthIndex: newDoc.months.findIndex(m => m.year === numericYear && m.month === numericMonth)
        };
      }
    }
  } catch (err) {
    logToConsole("WARN", "ERROR_CHECKING_NEW_COLLECTION", { error: err.message });
  }

  return { data: null, source: null, doc: null, monthIndex: -1 };
};

// ===============================
// HELPER: SAVE MONTH DATA
// ===============================
const saveMonthData = async (clientId, year, month, monthData, existingSource, context) => {
  const numericYear = parseInt(year);
  const numericMonth = parseInt(month);

  if (existingSource === 'old') {
    if (context.client) {
      const y = String(numericYear);
      const m = String(numericMonth);
      if (!context.client.documents.has(y)) {
        context.client.documents.set(y, new Map());
      }
      context.client.documents.get(y).set(m, monthData);
      await context.client.save();
      logToConsole("INFO", "SAVED_TO_OLD_COLLECTION", { clientId, year, month });
      return { savedTo: 'old' };
    }
  } else {
    let doc = context.newDoc;
    if (!doc) {
      doc = await ClientMonthlyData.findOne({ clientId });
      if (!doc) {
        const client = await Client.findOne({ clientId });
        doc = new ClientMonthlyData({
          clientId: clientId,
          clientName: client?.name || '',
          clientEmail: client?.email || '',
          months: []
        });
      }
    }

    const existingIndex = doc.months.findIndex(m => m.year === numericYear && m.month === numericMonth);

    if (existingIndex !== -1) {
      doc.months[existingIndex] = monthData;
    } else {
      doc.months.push(monthData);
    }

    doc.months.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    await doc.save();
    logToConsole("INFO", "SAVED_TO_NEW_COLLECTION", { clientId, year, month });
    return { savedTo: 'new' };
  }
};

// ===============================
// HELPER: LOG ACTIVITY
// ===============================
const logActivity = async (name, adminId, action, details) => {
  try {
    await ActivityLog.create({
      userName: name,
      role: "ADMIN",
      adminId: adminId,
      action,
      details,
      dateTime: new Date()
    });
    logToConsole("INFO", "ACTIVITY_LOG_CREATED", { adminName: name, adminId, action, details });
  } catch (logError) {
    logToConsole("ERROR", "ACTIVITY_LOG_FAILED", { error: logError.message });
  }
};

// ===============================
// DEBUG MIDDLEWARE - Helps debug 403 errors
// ===============================
router.use((req, res, next) => {
  console.log("🔍 === ADMIN MONTH LOCK DEBUG ===");
  console.log("🔍 URL:", req.method, req.url);
  console.log("🔍 Cookies:", req.cookies);
  console.log("🔍 Authorization Header:", req.headers.authorization);
  console.log("🔍 Body:", req.body);
  console.log("🔍 User (after auth):", req.user);
  console.log("==================================");
  next();
});

// ===============================
// LOCK MONTH - SIMPLE VERSION
// NO CHECKS, NO EMAILS, JUST LOCK
// ===============================
router.post("/month-lock/:clientId", auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { year, month } = req.body;

    logToConsole("INFO", "SIMPLE_MONTH_LOCK_REQUEST", {
      adminId: req.user?.adminId,
      adminName: req.user?.name,
      clientId,
      year,
      month,
      ip: req.ip
    });

    // Validation
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required"
      });
    }

    // Find client
    const client = await Client.findOne({ clientId });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    // Get month data from both collections
    const newMonthResult = await getMonthDataFromBoth(clientId, year, month);
    let monthData = null;
    let source = null;
    let context = { client, newDoc: newMonthResult.doc };

    if (newMonthResult.data) {
      monthData = newMonthResult.data;
      source = newMonthResult.source;
      context.newDoc = newMonthResult.doc;
      logToConsole("DEBUG", "MONTH_FOUND_IN_NEW_COLLECTION", { clientId, year, month });
    } else {
      // Check OLD collection
      const yearKey = String(year);
      const monthKey = String(month);
      if (client.documents.has(yearKey) && client.documents.get(yearKey).has(monthKey)) {
        monthData = client.documents.get(yearKey).get(monthKey);
        source = 'old';
        logToConsole("DEBUG", "MONTH_FOUND_IN_OLD_COLLECTION", { clientId, year, month });
      }
    }

    // Create month data if doesn't exist
    if (!monthData) {
      monthData = {};
      source = null;
      logToConsole("DEBUG", "CREATING_NEW_MONTH_DATA", { clientId, year, month });
    }

    // SIMPLE LOCK - Just set isLocked to true
    monthData.isLocked = true;
    monthData.lockedAt = new Date();
    monthData.lockedBy = req.user.name;

    // Save to appropriate collection
    await saveMonthData(clientId, year, month, monthData, source, context);

    // Log activity
    await logActivity(
      req.user.name,
      req.user.adminId,
      "MONTH_LOCKED",
      `Locked month ${month}/${year} for client: ${client.name}`
    );

    logToConsole("SUCCESS", "MONTH_LOCKED_SUCCESSFULLY", {
      clientId,
      clientName: client.name,
      year,
      month,
      lockedBy: req.user.name
    });

    res.json({
      success: true,
      message: `Month ${month}/${year} locked successfully`,
      clientId,
      year,
      month,
      isLocked: true,
      lockedAt: monthData.lockedAt,
      lockedBy: monthData.lockedBy
    });

  } catch (error) {
    logToConsole("ERROR", "MONTH_LOCK_ERROR", {
      error: error.message,
      stack: error.stack,
      clientId: req.params.clientId,
      adminId: req.user?.adminId
    });

    await logActivity(
      req.user?.name || "SYSTEM",
      req.user?.adminId || "SYSTEM",
      "MONTH_LOCK_ERROR",
      `Error locking month: ${error.message}`
    );

    res.status(500).json({
      success: false,
      message: "Error locking month",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===============================
// UNLOCK MONTH - WITH ALL CATEGORIES UNLOCK
// (LOCK LOGIC REMAINS UNCHANGED)
// ===============================
router.post("/month-unlock/:clientId", auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { year, month } = req.body;

    logToConsole("INFO", "MONTH_UNLOCK_WITH_CATEGORIES_REQUEST", {
      adminId: req.user?.adminId,
      adminName: req.user?.name,
      clientId,
      year,
      month,
      ip: req.ip
    });

    // Validation
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required"
      });
    }

    // Find client
    const client = await Client.findOne({ clientId });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    // Get month data from both collections
    const newMonthResult = await getMonthDataFromBoth(clientId, year, month);
    let monthData = null;
    let source = null;
    let context = { client, newDoc: newMonthResult.doc };

    if (newMonthResult.data) {
      monthData = newMonthResult.data;
      source = newMonthResult.source;
      context.newDoc = newMonthResult.doc;
      logToConsole("DEBUG", "MONTH_FOUND_IN_NEW_COLLECTION", { clientId, year, month });
    } else {
      // Check OLD collection
      const yearKey = String(year);
      const monthKey = String(month);
      if (client.documents.has(yearKey) && client.documents.get(yearKey).has(monthKey)) {
        monthData = client.documents.get(yearKey).get(monthKey);
        source = 'old';
        logToConsole("DEBUG", "MONTH_FOUND_IN_OLD_COLLECTION", { clientId, year, month });
      }
    }

    // If month doesn't exist, create it
    if (!monthData) {
      monthData = {};
      source = null;
      logToConsole("DEBUG", "CREATING_NEW_MONTH_DATA", { clientId, year, month });
    }

    // ===== UNLOCK MONTH LEVEL =====
    monthData.isLocked = false;
    monthData.lockedAt = null;
    monthData.lockedBy = null;

    // ===== UNLOCK ALL CATEGORIES =====

    // 1. Unlock Sales
    if (monthData.sales) {
      monthData.sales.isLocked = false;
      monthData.sales.lockedAt = null;
      monthData.sales.lockedBy = null;
      logToConsole("DEBUG", "UNLOCKED_SALES_CATEGORY", { clientId, year, month });
    }

    // 2. Unlock Purchase
    if (monthData.purchase) {
      monthData.purchase.isLocked = false;
      monthData.purchase.lockedAt = null;
      monthData.purchase.lockedBy = null;
      logToConsole("DEBUG", "UNLOCKED_PURCHASE_CATEGORY", { clientId, year, month });
    }

    // 3. Unlock Bank
    if (monthData.bank) {
      monthData.bank.isLocked = false;
      monthData.bank.lockedAt = null;
      monthData.bank.lockedBy = null;
      logToConsole("DEBUG", "UNLOCKED_BANK_CATEGORY", { clientId, year, month });
    }

    // 4. Unlock ALL Other Categories
    if (monthData.other && Array.isArray(monthData.other)) {
      monthData.other.forEach(otherCat => {
        if (otherCat.document) {
          otherCat.document.isLocked = false;
          otherCat.document.lockedAt = null;
          otherCat.document.lockedBy = null;
        }
      });
      logToConsole("DEBUG", "UNLOCKED_ALL_OTHER_CATEGORIES", {
        clientId,
        year,
        month,
        otherCount: monthData.other.length
      });
    }

    // Save to appropriate collection
    await saveMonthData(clientId, year, month, monthData, source, context);

    // Log activity
    await logActivity(
      req.user.name,
      req.user.adminId,
      "MONTH_UNLOCKED_WITH_CATEGORIES",
      `Unlocked month ${month}/${year} AND all categories for client: ${client.name}`
    );

    logToConsole("SUCCESS", "MONTH_AND_CATEGORIES_UNLOCKED", {
      clientId,
      clientName: client.name,
      year,
      month,
      unlockedBy: req.user.name
    });

    res.json({
      success: true,
      message: `Month ${month}/${year} and all categories unlocked successfully`,
      clientId,
      year,
      month,
      isLocked: false,
      categoriesUnlocked: true
    });

  } catch (error) {
    logToConsole("ERROR", "MONTH_UNLOCK_WITH_CATEGORIES_ERROR", {
      error: error.message,
      stack: error.stack,
      clientId: req.params.clientId,
      adminId: req.user?.adminId
    });

    await logActivity(
      req.user?.name || "SYSTEM",
      req.user?.adminId || "SYSTEM",
      "MONTH_UNLOCK_ERROR",
      `Error unlocking month: ${error.message}`
    );

    res.status(500).json({
      success: false,
      message: "Error unlocking month",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;