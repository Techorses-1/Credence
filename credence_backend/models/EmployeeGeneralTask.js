const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * GENERAL TASK SCHEMA
 * - Separate from predefined tasks (Bookkeeping, VAT Filing, Audit, etc.)
 * - Employee-specific, NOT client-specific
 * - Multiple tasks per employee (array)
 * - Status: pending | completed | cancelled
 */
const generalTaskSchema = new mongoose.Schema(
    {
        taskId: {
            type: String,
            unique: true,
            default: () => uuidv4(),
            required: true
        },
        task: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'pending',
            required: true
        },
        // Admin who created this task
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: String, // adminId
            required: true
        },
        createdByName: {
            type: String,
            required: true
        },

        // Employee marks as completed
        completedAt: {
            type: Date
        },
        completedBy: {
            type: String // employeeId
        },
        employeeNotes: {
            type: String,
            trim: true,
            default: null
        },

        // Admin cancels the task (only if status is pending)
        cancelledAt: {
            type: Date
        },
        cancelledBy: {
            type: String // adminId
        },
        cancelledByName: {
            type: String // admin name
        },
        cancellationReason: {
            type: String,
            trim: true,
            default: null
        }
    },
    { _id: false }
);

/**
 * MAIN EMPLOYEE GENERAL TASK COLLECTION
 * - Stores employee info ONCE
 * - Tasks stored as array
 * - Indexed by employeeId for fast queries
 */
const employeeGeneralTaskSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        employeeName: {
            type: String,
            required: true
        },
        employeeEmail: {
            type: String,
            required: true
        },
        tasks: [generalTaskSchema]
    },
    { timestamps: true }
);

// Create indexes for faster queries
employeeGeneralTaskSchema.index({ employeeId: 1, 'tasks.status': 1 });
employeeGeneralTaskSchema.index({ 'tasks.taskId': 1 });

module.exports = mongoose.model("EmployeeGeneralTask", employeeGeneralTaskSchema);