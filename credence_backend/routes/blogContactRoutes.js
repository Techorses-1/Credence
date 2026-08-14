const express = require("express");
const { v4: uuidv4 } = require("uuid");
const BlogContact = require("../models/BlogContact");
const ActivityLog = require("../models/ActivityLog");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

// ==============================================
// SUBMIT BLOG CONTACT FORM
// ==============================================
router.post("/submit", async (req, res) => {
  try {
    console.log("📝 BLOG CONTACT REQUEST:", req.body);

    // Extract data
    const { name, email, phone, message, blogId, blogTitle } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message || !blogId || !blogTitle) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, phone, message, blogId, blogTitle"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Phone validation (basic - at least 5 digits)
    const phoneRegex = /^\d{5,}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)\+]/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number"
      });
    }

    // Check if same email + phone combination exists within 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const existingRequest = await BlogContact.findOne({
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      submittedAt: { $gte: fortyEightHoursAgo }
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a request from this email/phone. Please wait 48 hours.",
        contactId: existingRequest.contactId
      });
    }

    // Create unique contact ID
    const contactId = `BC-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Create blog contact record
    const contactData = {
      contactId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      message: message.trim(),
      blogId: blogId.trim(),
      blogTitle: blogTitle.trim()
    };

    const newContact = await BlogContact.create(contactData);
    console.log("✅ BLOG CONTACT SAVED:", {
      contactId: newContact.contactId,
      name: newContact.name,
      email: newContact.email,
      blogTitle: newContact.blogTitle
    });

    // ==============================================
    // SEND CONFIRMATION EMAIL TO USER
    // ==============================================
    try {
      const userEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7cd64b; text-align: center;">Thank You for Contacting Us!</h2>
          
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Thank you for reaching out to us regarding our blog post:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0;"><strong>Blog:</strong> ${blogTitle}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Request Details:</strong></p>
            <p><strong>Request ID:</strong> ${contactId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Your Message:</strong></p>
            <p style="font-style: italic;">"${message}"</p>
          </div>
          
          <p>Our team will review your message and get back to you within <strong>24-48 hours</strong>.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>Credence Accounting Services</strong>
            </p>
          </div>
        </div>
      `;

      await sendEmail(
        email,
        "Thank You for Contacting Credence Accounting Services",
        userEmailContent
      );

      console.log("✅ USER CONFIRMATION EMAIL SENT:", email);
    } catch (emailError) {
      console.error("❌ USER EMAIL FAILED:", emailError.message);
      // Don't fail the request if email fails
    }

    // ==============================================
    // SEND NOTIFICATION EMAIL TO ADMIN
    // ==============================================
    try {
      const adminEmail = process.env.EMAIL_USER || "support@jladgroup.fi";

      const adminEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff6b6b; background: #fff5f5; padding: 15px; border-radius: 8px;">
            📝 New Blog Contact Request
          </h2>
          
          <p><strong>A new contact request has been submitted from blog page:</strong></p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7cd64b;">
            <h3 style="margin-top: 0; color: #333;">Blog Details:</h3>
            <p><strong>Blog:</strong> ${blogTitle}</p>
            <p><strong>Blog ID:</strong> ${blogId}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Client Details:</h3>
            <p><strong>Request ID:</strong> ${contactId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: "Europe/Helsinki" })}</p>
          </div>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Message from Client:</h3>
            <p style="font-style: italic;">"${message}"</p>
          </div>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 6px;">
            <p><strong>⚠️ Action Required:</strong> Please contact the client within 24 hours.</p>
            <p><strong>📞 Phone:</strong> ${phone}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
          </div>
        </div>
      `;

      await sendEmail(
        adminEmail,
        `New Blog Contact: ${name} - ${blogTitle.substring(0, 50)}`,
        adminEmailContent
      );

      console.log("✅ ADMIN NOTIFICATION EMAIL SENT:", adminEmail);
    } catch (emailError) {
      console.error("❌ ADMIN EMAIL FAILED:", emailError.message);
    }

    // ==============================================
    // ACTIVITY LOG
    // ==============================================
    await ActivityLog.create({
      userName: name,
      action: "BLOG_CONTACT_SUBMITTED",
      details: `Blog contact request from ${name} (${phone}) for blog: ${blogTitle}`
    });

    // ==============================================
    // SUCCESS RESPONSE
    // ==============================================
    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We will contact you soon.",
      contactId: newContact.contactId,
      data: {
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone,
        message: newContact.message,
        blogTitle: newContact.blogTitle,
        submittedAt: newContact.submittedAt
      }
    });

  } catch (error) {
    console.error("❌ BLOG CONTACT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate request detected. Please try again later."
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during submission. Please try again later."
    });
  }
});

// ==============================================
// GET ALL BLOG CONTACTS (FOR ADMIN)
// ==============================================
router.get("/all", async (req, res) => {
  try {
    const contacts = await BlogContact.find().sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    console.error("Error fetching blog contacts:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ==============================================
// GET SINGLE BLOG CONTACT BY ID
// ==============================================
router.get("/:contactId", async (req, res) => {
  try {
    const contact = await BlogContact.findOne({
      contactId: req.params.contactId
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact request not found"
      });
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ==============================================
// GET CONTACTS BY BLOG ID
// ==============================================
router.get("/blog/:blogId", async (req, res) => {
  try {
    const contacts = await BlogContact.find({
      blogId: req.params.blogId
    }).sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    console.error("Error fetching blog contacts:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;