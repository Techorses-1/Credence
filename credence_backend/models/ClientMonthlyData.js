const mongoose = require("mongoose");

/* ===============================
   NOTE VIEW TRACKING SCHEMA
================================ */
const noteViewSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        userType: { type: String, required: true, enum: ['client', 'employee', 'admin'] },
        viewedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

/* ===============================
   NOTE SCHEMA
================================ */
const noteSchema = new mongoose.Schema(
    {
        note: { type: String, required: true },
        addedBy: { type: String },
        addedAt: { type: Date, default: Date.now },
        employeeId: { type: String },
        viewedBy: { type: [noteViewSchema], default: [] },
        isViewedByClient: { type: Boolean, default: false },
        isViewedByEmployee: { type: Boolean, default: false },
        isViewedByAdmin: { type: Boolean, default: false }
    },
    { _id: false }
);

/* ===============================
   SINGLE DOCUMENT (FILE LEVEL)
================================ */
const singleDocumentSchema = new mongoose.Schema(
    {
        url: String,
        uploadedAt: Date,
        uploadedBy: String,
        fileName: String,
        fileSize: Number,
        fileType: String,
        notes: [noteSchema]
    },
    { _id: false }
);

/* ===============================
   CATEGORY WITH MULTIPLE FILES
================================ */
const categorySchema = new mongoose.Schema(
    {
        files: [singleDocumentSchema],
        isLocked: { type: Boolean, default: false },
        lockedAt: Date,
        lockedBy: String,
        categoryNotes: [noteSchema],
        wasLockedOnce: { type: Boolean, default: false }
    },
    { _id: false }
);

/* ===============================
   OTHER CATEGORY
================================ */
const otherCategorySchema = new mongoose.Schema(
    {
        categoryName: { type: String, required: true },
        document: categorySchema
    },
    { _id: false }
);

/* ===============================
   MONTH DATA SCHEMA (ONE MONTH) - UPDATED WITH 3-STATUS PAYMENT
================================ */
const monthDataSchema = new mongoose.Schema(
    {
        year: { type: Number, required: true },
        month: { type: Number, required: true },
        sales: categorySchema,
        purchase: categorySchema,
        bank: categorySchema,
        other: [otherCategorySchema],
        isLocked: { type: Boolean, default: false },
        wasLockedOnce: { type: Boolean, default: false },
        lockedAt: Date,
        lockedBy: String,
        autoLockDate: Date,
        monthNotes: [noteSchema],
        accountingDone: { type: Boolean, default: false },
        accountingDoneAt: Date,
        accountingDoneBy: String,
        monthActiveStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
        monthStatusChangedAt: Date,
        monthStatusChangedBy: String,
        monthStatusReason: String,

        // ✅ UPDATED: PAYMENT STATUS WITH 3 OPTIONS (paid, pending, not_credited)
        paymentStatus: {
            type: String,
            enum: ['paid', 'pending', 'not_credited'],
            default: 'pending'
        },
        paymentUpdatedAt: Date,
        paymentUpdatedBy: String,
        paymentUpdatedByName: String,
        paymentNotes: String,

        // ✅ UPDATED: Payment history tracking with 3 options
        paymentHistory: [
            {
                status: { type: String, enum: ['paid', 'pending', 'not_credited'], required: true },
                changedAt: { type: Date, default: Date.now },
                changedBy: String,
                changedByName: String,
                notes: String
            }
        ]
    },
    { _id: false }
);

/* ===============================
   CLIENT MONTHLY DATA SCHEMA
   One document per client with months array
================================ */
const clientMonthlyDataSchema = new mongoose.Schema(
    {
        clientId: { type: String, required: true, unique: true, index: true },
        clientName: { type: String },
        clientEmail: { type: String },
        months: [monthDataSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("ClientMonthlyData", clientMonthlyDataSchema);