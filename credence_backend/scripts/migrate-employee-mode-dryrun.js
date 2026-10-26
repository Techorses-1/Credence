// scripts/migrate-employee-mode-dryrun.js
//
// DRY RUN — READ ONLY
// -------------------
// This script does NOT modify the database. It only reports what WOULD change
// if we ran the real migration.
//
// Logic:
//   - If employee.mode is already set  → skip (already migrated)
//   - If employee.isActive === true    → would set mode = "normal"
//   - If employee.isActive === false   → would set mode = "admin"
//
// Run with:  node scripts/migrate-employee-mode-dryrun.js

const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();

const Employee = require("../models/Employee");

// Hardcoded URI (same as connectDB.js)
const MONGO_URI =
    "mongodb://admin:Admin%402025@93.127.167.226:27017/credencemain210526?authSource=admin&authMechanism=SCRAM-SHA-256";

const pad = (s, n = 2) => String(s).padStart(n, " ");

const run = async () => {
    console.log("\n========================================================");
    console.log("  EMPLOYEE MODE MIGRATION — DRY RUN (NO DB WRITES)");
    console.log("========================================================\n");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const total = await Employee.countDocuments({});
    console.log(`📊 Total employees in DB: ${total}\n`);

    // Fetch only fields we need
    const employees = await Employee.find(
        {},
        {
            employeeId: 1,
            name: 1,
            email: 1,
            isActive: 1,
            mode: 1,
            _id: 0
        }
    ).lean();

    let alreadyMigrated = 0;
    let wouldSetNormal = 0;
    let wouldSetAdmin = 0;
    let wouldSetDeletedButActive = 0; // edge case: mode=deleted but isActive=true
    let unknownCase = 0;

    const previewNormal = [];
    const previewAdmin = [];
    const previewAlready = [];
    const previewUnknown = [];

    for (const emp of employees) {
        const hasMode =
            emp.mode === "normal" ||
            emp.mode === "admin" ||
            emp.mode === "deleted";

        if (hasMode) {
            alreadyMigrated++;
            previewAlready.push(emp);

            // Edge case detection: mode="deleted" but isActive=true (shouldn't happen but flag it)
            if (emp.mode === "deleted" && emp.isActive === true) {
                wouldSetDeletedButActive++;
            }
            continue;
        }

        // mode missing → determine what it WOULD become
        if (emp.isActive === true) {
            wouldSetNormal++;
            previewNormal.push(emp);
        } else if (emp.isActive === false) {
            wouldSetAdmin++;
            previewAdmin.push(emp);
        } else {
            unknownCase++;
            previewUnknown.push(emp);
        }
    }

    // ---------- Print details ----------
    console.log('────────── WOULD SET mode = "normal" ──────────');
    console.log(`Count: ${previewNormal.length}`);
    previewNormal.slice(0, 50).forEach((e, i) => {
        console.log(
            `  ${pad(i + 1, 3)}. ${e.name} <${e.email}>  isActive=${e.isActive}  employeeId=${e.employeeId}`
        );
    });
    if (previewNormal.length > 50) {
        console.log(`  ... and ${previewNormal.length - 50} more`);
    }
    console.log("");

    console.log('────────── WOULD SET mode = "admin" ──────────');
    console.log(`Count: ${previewAdmin.length}`);
    previewAdmin.slice(0, 50).forEach((e, i) => {
        console.log(
            `  ${pad(i + 1, 3)}. ${e.name} <${e.email}>  isActive=${e.isActive}  employeeId=${e.employeeId}`
        );
    });
    if (previewAdmin.length > 50) {
        console.log(`  ... and ${previewAdmin.length - 50} more`);
    }
    console.log("");

    console.log("────────── SKIPPED (already has mode) ──────────");
    console.log(`Count: ${previewAlready.length}`);
    previewAlready.slice(0, 50).forEach((e, i) => {
        console.log(
            `  ${pad(i + 1, 3)}. ${e.name} <${e.email}>  mode=${e.mode}  isActive=${e.isActive}`
        );
    });
    if (previewAlready.length > 50) {
        console.log(`  ... and ${previewAlready.length - 50} more`);
    }
    console.log("");

    if (previewUnknown.length > 0) {
        console.log("────────── UNKNOWN (isActive is neither true nor false) ──────────");
        console.log(`Count: ${previewUnknown.length}`);
        previewUnknown.forEach((e, i) => {
            console.log(
                `  ${pad(i + 1, 3)}. ${e.name} <${e.email}>  isActive=${e.isActive}  mode=${e.mode}`
            );
        });
        console.log("");
    }

    if (wouldSetDeletedButActive > 0) {
        console.log(
            `⚠️  EDGE CASE: ${wouldSetDeletedButActive} employee(s) have mode="deleted" but isActive=true. Review manually.\n`
        );
    }

    // ---------- Summary ----------
    console.log("================= SUMMARY =================");
    console.log(`Total employees              : ${total}`);
    console.log(`Already have mode (skipped)  : ${alreadyMigrated}`);
    console.log(`Would be set to "normal"     : ${wouldSetNormal}`);
    console.log(`Would be set to "admin"      : ${wouldSetAdmin}`);
    console.log(`Unknown / needs review       : ${unknownCase}`);
    console.log("==========================================\n");

    console.log("ℹ️  DRY RUN ONLY — no documents were modified.\n");

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.\n");
};

run().catch(async (err) => {
    console.error("❌ Script failed:", err);
    try {
        await mongoose.connection.close();
    } catch (_) {
        /* ignore */
    }
    process.exit(1);
});