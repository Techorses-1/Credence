const express = require('express');
const router = express.Router();
const FinancialStatementRequest = require('../models/FinancialStatementRequestNew'); // ← NEW COLLECTION
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');

// Middleware to verify client token
const verifyClientToken = (req, res, next) => {
  const token = req.cookies.clientToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'CLIENT') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    req.clientId = decoded.clientId;
    req.clientName = decoded.name;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Helper function to format date range for display
const formatDateRange = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${from.toLocaleDateString('en-IN', options)} - ${to.toLocaleDateString('en-IN', options)}`;
};

router.post('/request', verifyClientToken, async (req, res) => {
  try {
    const { fromDate, toDate, additionalNotes } = req.body;

    console.log('📥 Received request:', { fromDate, toDate, additionalNotes });

    // Validate required fields
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: 'From date and to date are required'
      });
    }

    // Parse dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // VALIDATION 1: Future dates check
    if (from > today) {
      return res.status(400).json({
        success: false,
        message: 'From date cannot be in the future'
      });
    }
    if (to > today) {
      return res.status(400).json({
        success: false,
        message: 'To date cannot be in the future'
      });
    }

    // VALIDATION 2: Date order check
    if (to < from) {
      return res.status(400).json({
        success: false,
        message: 'To date must be after or equal to from date'
      });
    }

    // Get client details from database
    const client = await Client.findOne({ clientId: req.clientId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const clientEmail = client.email;
    const clientName = client.name || req.clientName || 'Client';
    const year = from.getFullYear();

    // ========== Find or create client document ==========
    let clientDoc = await FinancialStatementRequest.findOne({ clientId: req.clientId });

    if (!clientDoc) {
      // Create new document for this client
      clientDoc = new FinancialStatementRequest({
        clientId: req.clientId,
        clientName: clientName,
        clientEmail: clientEmail,
        requests: []
      });
    }

    // ====================================================
    // ✅ UPDATED: Check if this is a FREE or PAID request
    // ====================================================
    // CORRECT LOGIC: Check how many requests in THIS YEAR using requestedAt (submission time)
    const currentYear = new Date().getFullYear();

    const existingRequestsInYear = clientDoc.requests.filter(r => {
      const requestYear = new Date(r.requestedAt).getFullYear();
      return requestYear === currentYear;
    });

    const isFirstRequestInYear = existingRequestsInYear.length === 0;
    const isPaid = !isFirstRequestInYear; // 1st = FREE, 2nd+ = PAID

    console.log(`📊 Existing requests in ${currentYear}: ${existingRequestsInYear.length}`);
    console.log(`💰 isPaid: ${isPaid} (${isFirstRequestInYear ? 'FREE' : 'PAID'})`);

    // Create date range display string
    const dateRangeDisplay = formatDateRange(from, to);

    // ========== Create request object ==========
    const newRequest = {
      requestId: `FSR${Date.now()}${Math.floor(Math.random() * 1000)}`,
      fromDate: from,
      toDate: to,
      dateRangeDisplay,
      year: year,
      status: 'pending',
      requestedAt: new Date(),
      isPaid: isPaid,
      adminNotes: additionalNotes || '',
      emailSentToAdmin: false,
      emailSentToClient: false,
      statementSentEmail: false
    };

    // Add request to client document
    clientDoc.requests.push(newRequest);
    await clientDoc.save();

    console.log('✅ Request saved successfully:', newRequest.requestId);

    // ========== Send emails ==========
    const adminEmail = process.env.EMAIL_USER;
    const paidStatus = isPaid ? '💰 PAID REQUEST' : '✅ FREE REQUEST (1st in ' + currentYear + ')';

    const adminSubject = `New Financial Statement Request - ${clientName}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Financial Statement Request</h2>
        <div style="background: ${isPaid ? '#fff3e0' : '#e8f5e9'}; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${isPaid ? '#ff9800' : '#4caf50'};">
          <h3>Request Details:</h3>
          <p><strong>Client Name:</strong> ${clientName}</p>
          <p><strong>Client Email:</strong> ${clientEmail}</p>
          <p><strong>Client ID:</strong> ${req.clientId}</p>
          <p><strong>Requested Period:</strong> ${dateRangeDisplay}</p>
          <p><strong>From Date:</strong> ${from.toLocaleDateString('en-IN')}</p>
          <p><strong>To Date:</strong> ${to.toLocaleDateString('en-IN')}</p>
          <p><strong>Request ID:</strong> ${newRequest.requestId}</p>
          <p><strong>Requested At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: "Europe/Helsinki" })}</p>
          <p><strong>Payment Status:</strong> <span style="color: ${isPaid ? '#ff9800' : '#4caf50'}; font-weight: bold;">${paidStatus}</span></p>
          <p><strong>Reason:</strong> ${isPaid ? `This is the ${existingRequestsInYear.length + 1}th request in ${currentYear}` : `This is the 1st request in ${currentYear} - FREE!`}</p>
          ${additionalNotes ? `<p><strong>Additional Notes:</strong> ${additionalNotes}</p>` : ''}
          <p><strong>Total Requests in ${currentYear}:</strong> ${existingRequestsInYear.length + 1}</p>
        </div>
        <p>Please review this request and prepare the financial statements.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <small>This is an automated notification from Accounting Portal.</small>
        </div>
      </div>
    `;

    const clientSubject = `Financial Statement Request Received${isPaid ? ' (Paid Request)' : ' (Free Request)'}`;
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7cd64b;">Request Received Successfully!</h2>
        <div style="background: ${isPaid ? '#fff3e0' : '#f8fff5'}; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${isPaid ? '#ff9800' : '#7cd64b'};">
          <h3>Your Request Details:</h3>
          <p><strong>Request ID:</strong> ${newRequest.requestId}</p>
          <p><strong>Requested Period:</strong> ${dateRangeDisplay}</p>
          <p><strong>From Date:</strong> ${from.toLocaleDateString('en-IN')}</p>
          <p><strong>To Date:</strong> ${to.toLocaleDateString('en-IN')}</p>
          <p><strong>Status:</strong> <span style="color: #ffa500; font-weight: bold;">Pending Review</span></p>
          <p><strong>Payment:</strong> <span style="color: ${isPaid ? '#ff9800' : '#4caf50'}; font-weight: bold;">${isPaid ? '💰 PAID REQUEST' : '✅ FREE REQUEST (1st in ' + currentYear + ')'}</span></p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: "Europe/Helsinki" })}</p>
          <p><strong>Reason:</strong> ${isPaid ? `This is your ${existingRequestsInYear.length + 1}th request in ${currentYear}` : `This is your 1st request in ${currentYear} - FREE!`}</p>
        </div>
        ${isPaid ? `
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p><strong>💰 Payment Note:</strong> This is your ${existingRequestsInYear.length + 1}th request in ${currentYear}. Only the 1st request in a year is FREE. All subsequent requests are PAID.</p>
        </div>
        ` : `
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <p><strong>✅ Free Request:</strong> This is your 1st request in ${currentYear} and it's FREE!</p>
        </div>
        `}
        <p><strong>What happens next?</strong></p>
        <ol style="margin-left: 20px;">
          <li>Our admin team has been notified of your request</li>
          <li>We will review and prepare your financial statements</li>
          <li>You will receive another email when statements are ready</li>
          <li>Statements will be available in your dashboard</li>
        </ol>
        <p style="margin-top: 30px;">Thank you for using our accounting services!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <small>This is an automated confirmation from Accounting Portal.</small>
        </div>
      </div>
    `;

    // Send emails
    Promise.allSettled([
      sendEmail(adminEmail, adminSubject, adminHtml),
      sendEmail(clientEmail, clientSubject, clientHtml)
    ]).then(results => {
      // Update email sent status in the request
      const requestIndex = clientDoc.requests.findIndex(r => r.requestId === newRequest.requestId);
      if (requestIndex !== -1) {
        clientDoc.requests[requestIndex].emailSentToAdmin = results[0].status === 'fulfilled';
        clientDoc.requests[requestIndex].emailSentToClient = results[1].status === 'fulfilled';
        clientDoc.save().catch(console.error);
      }
    });

    res.status(201).json({
      success: true,
      message: isPaid ? 'Request submitted successfully (Paid Request)' : 'Request submitted successfully (Free Request)',
      data: {
        requestId: newRequest.requestId,
        fromDate: newRequest.fromDate,
        toDate: newRequest.toDate,
        dateRangeDisplay,
        status: newRequest.status,
        requestedAt: newRequest.requestedAt,
        isPaid: isPaid,
        isFirstRequestInYear: isFirstRequestInYear,
        totalRequestsInYear: existingRequestsInYear.length + 1,
        year: currentYear
      }
    });

  } catch (error) {
    console.error('❌ Error creating financial statement request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit request. Please try again.'
    });
  }
});


// ============================================
// 2. Get client's financial statement requests
// ============================================
router.get('/my-requests', verifyClientToken, async (req, res) => {
  try {
    const clientDoc = await FinancialStatementRequest.findOne({ clientId: req.clientId });

    if (!clientDoc) {
      return res.json({
        success: true,
        data: [],
        message: 'No requests found'
      });
    }

    // Sort requests by requestedAt (newest first)
    const requests = clientDoc.requests
      .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
      .slice(0, 50);

    res.json({
      success: true,
      data: requests,
      totalRequests: clientDoc.requests.length,
      clientInfo: {
        clientId: clientDoc.clientId,
        clientName: clientDoc.clientName,
        clientEmail: clientDoc.clientEmail
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

// ============================================
// 3. Check if request will be FREE or PAID
// ============================================
router.post('/check-payment-status', verifyClientToken, async (req, res) => {
  try {
    const { fromDate } = req.body;

    if (!fromDate) {
      return res.status(400).json({
        success: false,
        message: 'From date is required'
      });
    }

    const year = new Date(fromDate).getFullYear();

    let clientDoc = await FinancialStatementRequest.findOne({ clientId: req.clientId });

    if (!clientDoc) {
      return res.json({
        success: true,
        isFirstRequest: true,
        isPaid: false,
        totalRequestsInYear: 0,
        year: year,
        message: 'This will be your 1st request in this year - FREE!'
      });
    }

    const requestsInYear = clientDoc.requests.filter(r => r.year === year);
    const totalRequests = requestsInYear.length;
    const isFirstRequest = totalRequests === 0;
    const isPaid = !isFirstRequest;

    res.json({
      success: true,
      isFirstRequest: isFirstRequest,
      isPaid: isPaid,
      totalRequestsInYear: totalRequests,
      year: year,
      message: isFirstRequest
        ? 'This will be your 1st request in this year - FREE!'
        : `This will be your ${totalRequests + 1}th request in this year - PAID REQUEST!`,
      existingRequests: requestsInYear.map(r => ({
        requestId: r.requestId,
        fromDate: r.fromDate,
        toDate: r.toDate,
        status: r.status,
        dateRangeDisplay: r.dateRangeDisplay,
        isPaid: r.isPaid
      }))
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
});

// ============================================
// 4. Get request status by ID
// ============================================
router.get('/status/:requestId', verifyClientToken, async (req, res) => {
  try {
    const clientDoc = await FinancialStatementRequest.findOne({ clientId: req.clientId });

    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = clientDoc.requests.find(r => r.requestId === req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request status'
    });
  }
});

// ============================================
// 5. Cancel a pending request
// ============================================
router.put('/cancel/:requestId', verifyClientToken, async (req, res) => {
  try {
    const clientDoc = await FinancialStatementRequest.findOne({ clientId: req.clientId });

    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const requestIndex = clientDoc.requests.findIndex(r => r.requestId === req.params.requestId);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = clientDoc.requests[requestIndex];

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request with status: ${request.status}`
      });
    }

    request.status = 'cancelled';
    await clientDoc.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel request'
    });
  }
});

module.exports = router;