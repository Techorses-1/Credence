// scripts/migrate-employee-mode.js
//
// REAL MIGRATION — WRITES TO DB (FIXED VERSION)
// ---------------------------------------------
// Uses .lean() to fetch raw DB values (no Mongoose defaults applied),
// then updateOne() only for docs that actually lack `mode` in DB.
//
// Logic:
//   - mode missing in DB + isActive=true   → set mode = "normal"
//   - mode missing in DB + isActive=false  → set mode = "admin"
//   - mode already set in DB               → skip
//
// Idempotent — safe to re-run.
//
// Run:  node scripts/migrate-employee-mode.js

const mongoose = require("mongoose");
require("dotenv").config();

const Employee = require("../models/Employee");

const MONGO_URI =
    "mongodb://admin:Admin%402025@93.127.167.226:27017/credencemain210526?authSource=admin&authMechanism=SCRAM-SHA-256";

const pad = (s, n = 2) => String(s).padStart(n, " ");

const run = async () => {
    console.log("\n========================================================");
    console.log("  EMPLOYEE MODE MIGRATION — REAL RUN (WRITES TO DB)");
    console.log("  (raw DB values via .lean() — no Mongoose defaults)");
    console.log("========================================================\n");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const total = await Employee.countDocuments({});
    console.log(`📊 Total employees in DB: ${total}\n`);

    // .lean() returns RAW DB values — no schema defaults injected
    const employees = await Employee.find({}).lean();

    let alreadyMigrated = 0;
    let updatedToNormal = 0;
    let updatedToAdmin = 0;
    let unknownCase = 0;
    let failed = 0;
    const failedList = [];

    for (const emp of employees) {
        // RAW check: does the DB doc actually have `mode` set?
        const hasModeInDB =
            emp.mode === "normal" ||
            emp.mode === "admin" ||
            emp.mode === "deleted";

        if (hasModeInDB) {
            alreadyMigrated++;
            console.log(
                `⏭  SKIP     : ${emp.name} <${emp.email}>  DB mode="${emp.mode}"  isActive=${emp.isActive}`
            );
            continue;
        }

        // Determine target mode
        let targetMode = null;
        if (emp.isActive === true) {
            targetMode = "normal";
        } else if (emp.isActive === false) {
            targetMode = "admin";
        } else {
            unknownCase++;
            console.log(
                `⚠️  UNKNOWN  : ${emp.name} <${emp.email}>  isActive=${emp.isActive} — not touched`
            );
            continue;
        }

        // Write directly — no Mongoose hydration involved
        try {
            await Employee.updateOne(
                { _id: emp._id },
                { $set: { mode: targetMode } }
            );

            if (targetMode === "normal") {
                updatedToNormal++;
                console.log(
                    `✅ UPDATED → normal : ${emp.name} <${emp.email}>  (was isActive=true, mode missing)`
                );
            } else {
                updatedToAdmin++;
                console.log(
                    `✅ UPDATED → admin  : ${emp.name} <${emp.email}>  (was isActive=false, mode missing)`
                );
            }
        } catch (err) {
            failed++;
            failedList.push({ emp, error: err.message });
            console.log(
                `❌ FAILED   : ${emp.name} <${emp.email}>  error=${err.message}`
            );
        }
    }

    if (failedList.length > 0) {
        console.log("\n────────── FAILURES ──────────");
        failedList.forEach((f, i) => {
            console.log(
                `  ${pad(i + 1, 3)}. ${f.emp.name} <${f.emp.email}>  ${f.error}`
            );
        });
        console.log("");
    }

    console.log("\n================= SUMMARY =================");
    console.log(`Total employees in DB           : ${total}`);
    console.log(`Already had mode in DB (skipped): ${alreadyMigrated}`);
    console.log(`Updated → mode = "normal"       : ${updatedToNormal}`);
    console.log(`Updated → mode = "admin"        : ${updatedToAdmin}`);
    console.log(`Unknown / not touched           : ${unknownCase}`);
    console.log(`Failed                          : ${failed}`);
    console.log("==========================================\n");

    if (failed === 0 && unknownCase === 0) {
        console.log("✅ Migration completed successfully.\n");
    } else {
        console.log("⚠️  Migration completed with issues. Review above.\n");
    }

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.\n");
};

run().catch(async (err) => {
    console.error("❌ Script crashed:", err);
    try {
        await mongoose.connection.close();
    } catch (_) { }
    process.exit(1);
});