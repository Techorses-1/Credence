const express = require("express");
const { v4: uuidv4 } = require("uuid");
const ServiceRequest = require("../models/ServiceRequest");
const ActivityLog = require("../models/ActivityLog");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

// ==============================================
// SUBMIT SERVICE REQUEST (Contact / Enquiry Form)
// ==============================================
router.post("/submit", async (req, res) => {
    try {
        console.log("📝 SERVICE REQUEST:", req.body);

        // Extract data
        const { name, email, phone, service, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !service) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone, and service are required"
            });
        }

        // ===== 24-HOUR DUPLICATE CHECK (BY EMAIL, ACROSS ANY SERVICE) =====
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const existingRequest = await ServiceRequest.findOne({
            email: email.toLowerCase().trim(),
            submittedAt: { $gte: twentyFourHoursAgo }
        });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message:
                    "You've already submitted a request in the last 24 hours. Please wait before submitting again.",
                requestId: existingRequest.requestId
            });
        }

        // Create service request record
        const requestId = `SR-${uuidv4().slice(0, 8).toUpperCase()}`;

        const requestData = {
            requestId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            service: service.trim(),
            message: message ? message.trim() : ""
        };

        const newRequest = await ServiceRequest.create(requestData);
        console.log("✅ SERVICE REQUEST SAVED:", {
            requestId: newRequest.requestId,
            name: newRequest.name,
            email: newRequest.email,
            service: newRequest.service
        });

        // ===== SEND CONFIRMATION EMAIL TO USER =====
        try {
            const userEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7cd64b; text-align: center;">Request Received!</h2>

          <p>Dear <strong>${name}</strong>,</p>

          <p>Thank you for reaching out regarding <strong>${service}</strong>.</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Request Details:</strong></p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
          </div>

          <p>Our team will review your request and contact you within <strong>24-48 hours</strong>.</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>Your Team</strong>
            </p>
          </div>
        </div>
      `;

            await sendEmail(
                email,
                "Request Received - We'll Be In Touch Soon",
                userEmailContent
            );

            console.log("✅ USER CONFIRMATION EMAIL SENT:", email);
        } catch (emailError) {
            console.error("❌ USER EMAIL FAILED:", emailError.message);
        }

        // ===== SEND NOTIFICATION EMAIL TO ADMIN =====
        try {
            const adminEmail = process.env.EMAIL_USER || "support@yourdomain.com";

            const adminEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff6b6b; background: #fff5f5; padding: 15px; border-radius: 8px;">
            🔔 New Service Request
          </h2>

          <p><strong>A new service enquiry has been submitted:</strong></p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7cd64b;">
            <h3 style="margin-top: 0; color: #333;">Client Details:</h3>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service Interested:</strong> ${service}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
            <p><strong>Submitted:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Europe/Helsinki" })}</p>
          </div>

          <div style="background: #fff5f5; padding: 15px; border-radius: 6px;">
            <p><strong>⚠️ Action Required:</strong> Please contact the client within 24-48 hours.</p>
            <p><strong>📞 Phone:</strong> ${phone}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
          </div>
        </div>
      `;

            await sendEmail(
                adminEmail,
                `New Service Request: ${name} - ${service}`,
                adminEmailContent
            );

            console.log("✅ ADMIN NOTIFICATION EMAIL SENT:", adminEmail);
        } catch (emailError) {
            console.error("❌ ADMIN EMAIL FAILED:", emailError.message);
        }

        // ===== ACTIVITY LOG =====
        await ActivityLog.create({
            userName: name,
            action: "SERVICE_REQUEST_SUBMITTED",
            details: `Service request for ${service} by ${name} (${email})`
        });

        // Success response
        res.status(201).json({
            success: true,
            message: "Request submitted successfully. We will contact you soon.",
            requestId: newRequest.requestId,
            data: {
                name: newRequest.name,
                email: newRequest.email,
                service: newRequest.service,
                submittedAt: newRequest.submittedAt
            }
        });
    } catch (error) {
        console.error("❌ SERVICE REQUEST ERROR:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate request detected"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error during submission"
        });
    }
});

// ==============================================
// GET ALL SERVICE REQUESTS (FOR ADMIN)
// ==============================================
router.get("/all", async (req, res) => {
    try {
        const requests = await ServiceRequest.find().sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("Error fetching service requests:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ==============================================
// GET SINGLE SERVICE REQUEST BY ID
// ==============================================
router.get("/:requestId", async (req, res) => {
    try {
        const request = await ServiceRequest.findOne({
            requestId: req.params.requestId
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        res.json({
            success: true,
            request
        });
    } catch (error) {
        console.error("Error fetching request:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;