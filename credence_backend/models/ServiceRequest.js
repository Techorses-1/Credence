const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
    {
        requestId: {
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
        service: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            trim: true,
            default: ""
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);