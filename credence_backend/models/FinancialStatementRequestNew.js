const mongoose = require('mongoose');

// ============================================
// FINANCIAL STATEMENT REQUEST SCHEMA
// One document per client with array of requests
// ============================================
const financialStatementRequestNewSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    clientName: {
        type: String,
        required: true
    },
    clientEmail: {
        type: String,
        required: true
    },
    // ========== Array of all requests ==========
    requests: [{
        // ===== Basic Request Info =====
        requestId: {
            type: String,
            unique: true,
            default: () => `FSR${Date.now()}${Math.floor(Math.random() * 1000)}`
        },
        fromDate: {
            type: Date,
            required: true
        },
        toDate: {
            type: Date,
            required: true
        },
        dateRangeDisplay: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },

        // ===== Status =====
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'approved', 'sent', 'completed', 'rejected', 'cancelled'],
            default: 'pending'
        },

        // ===== Timestamps =====
        requestedAt: {
            type: Date,
            default: Date.now
        },

        // ===== Payment =====
        isPaid: {
            type: Boolean,
            default: false
        },

        // ===== Admin Notes =====
        adminNotes: {
            type: String,
            default: ''
        },

        // ===== Sent Info =====
        sentDate: {
            type: Date
        },
        downloadUrl: {
            type: String,
            default: ''
        },

        // ===== Processed By (Admin) =====
        processedBy: {
            adminId: String,
            adminName: String
        },
        processedAt: Date,

        // ===== Email Tracking =====
        emailSentToAdmin: {
            type: Boolean,
            default: false
        },
        emailSentToClient: {
            type: Boolean,
            default: false
        },
        statementSentEmail: {
            type: Boolean,
            default: false
        },

        // ============================================
        // ===== NEW: Employee Assignment Fields =====
        // ============================================

        // Employee assigned to this request
        assignedEmployeeId: {
            type: String,
            default: null
        },
        assignedEmployeeName: {
            type: String,
            default: null
        },
        assignedAt: {
            type: Date,
            default: null
        },
        assignedBy: {
            adminId: {
                type: String,
                default: null
            },
            adminName: {
                type: String,
                default: null
            }
        },

        // ===== Employee Notes (when sending to client) =====
        employeeNotes: {
            type: String,
            default: ''
        },

        // ===== Employee who sent to client =====
        sentByEmployeeId: {
            type: String,
            default: null
        },
        sentByEmployeeName: {
            type: String,
            default: null
        },
        sentToClientAt: {
            type: Date,
            default: null
        }
    }]
}, {
    timestamps: true
});

// ============= INDEXES =============
financialStatementRequestNewSchema.index({ clientId: 1 });
financialStatementRequestNewSchema.index({ clientEmail: 1 });
financialStatementRequestNewSchema.index({ clientName: 1 });
financialStatementRequestNewSchema.index({
    'requests.status': 1,
    'requests.requestedAt': -1
});
financialStatementRequestNewSchema.index({
    'requests.year': 1,
    'requests.clientId': 1
});

// ============= NEW INDEXES for Employee Assignment =============
financialStatementRequestNewSchema.index({
    'requests.assignedEmployeeId': 1,
    'requests.status': 1
});
financialStatementRequestNewSchema.index({
    'requests.assignedEmployeeId': 1,
    'requests.sentToClientAt': -1
});

const FinancialStatementRequestNew = mongoose.model('FinancialStatementRequestNew', financialStatementRequestNewSchema);

module.exports = FinancialStatementRequestNew;