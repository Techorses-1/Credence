const mongoose = require("mongoose");

const blogContactSchema = new mongoose.Schema(
    {
        contactId: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        blogId: {
            type: String,
            required: true,
            trim: true
        },
        blogTitle: {
            type: String,
            required: true,
            trim: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("BlogContact", blogContactSchema);