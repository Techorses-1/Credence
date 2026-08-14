const mongoose = require('mongoose');
const FinancialStatementRequest = require('../models/FinancialStatementRequest'); // OLD
const FinancialStatementRequestNew = require('../models/FinancialStatementRequestNew'); // NEW

// ============================================
// DIRECT CONNECTION STRING
// ============================================
const MONGO_URI = "mongodb://admin:Admin%402025@93.127.167.226:27017/credencemain210526?authSource=admin&authMechanism=SCRAM-SHA-256";

// ============================================
// ACTUAL MIGRATION SCRIPT - THIS WILL MODIFY DATABASE!
// Run: node scripts/migrateToNew.js
// ============================================

const migrateToNew = async () => {
    try {
        console.log('🚀 STARTING ACTUAL MIGRATION...');
        console.log('⚠️  THIS WILL MODIFY THE DATABASE!');
        console.log('📋 Make sure you have a backup before continuing!\n');

        console.log('📋 Connecting to database...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to database\n');

        // ========== STEP 1: Count documents ==========
        console.log('📊 STEP 1: Counting documents...');
        const oldCount = await FinancialStatementRequest.countDocuments({});
        const newCount = await FinancialStatementRequestNew.countDocuments({});

        console.log(`   📁 Old collection (FinancialStatementRequest): ${oldCount} documents`);
        console.log(`   📁 New collection (FinancialStatementRequestNew): ${newCount} documents`);
        console.log('   ✅ Count complete\n');

        if (oldCount === 0) {
            console.log('⚠️  No documents found in old collection!');
            console.log('📋 Nothing to migrate.');
            process.exit(0);
        }

        // ========== STEP 2: Ask for confirmation ==========
        console.log('⚠️  WARNING: This will migrate ALL data to new structure!');
        console.log(`📊 ${oldCount} documents will be transformed into ${newCount > 0 ? 'additional' : 'new'} documents.`);
        console.log('\nType "YES" to continue or "NO" to cancel:');

        // Wait for user input
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise((resolve) => {
            rl.question('> ', (ans) => {
                rl.close();
                resolve(ans.trim().toUpperCase());
            });
        });

        if (answer !== 'YES') {
            console.log('\n❌ Migration cancelled by user.');
            process.exit(0);
        }

        console.log('\n✅ Confirmation received. Starting migration...\n');

        // ========== STEP 3: Get all old documents ==========
        console.log('📊 STEP 3: Fetching all old documents...');
        const allOldDocs = await FinancialStatementRequest.find({}).lean();
        console.log(`   ✅ Found ${allOldDocs.length} old documents\n`);

        // ========== STEP 4: Group by clientId ==========
        console.log('📊 STEP 4: Grouping by clientId...');
        const clientGroups = {};

        allOldDocs.forEach(doc => {
            if (!clientGroups[doc.clientId]) {
                clientGroups[doc.clientId] = {
                    clientId: doc.clientId,
                    clientName: doc.clientName || 'Unknown',
                    clientEmail: doc.clientEmail || 'unknown@email.com',
                    requests: []
                };
            }
            clientGroups[doc.clientId].requests.push(doc);
        });

        const totalClients = Object.keys(clientGroups).length;
        console.log(`   ✅ Grouped into ${totalClients} clients\n`);

        // ========== STEP 5: Process each client ==========
        console.log('📊 STEP 5: Processing clients...');
        let migratedCount = 0;
        let errorCount = 0;
        let totalRequestsMigrated = 0;

        for (const [clientId, group] of Object.entries(clientGroups)) {
            try {
                // Sort requests by requestedAt (oldest first)
                const sortedRequests = group.requests.sort(
                    (a, b) => new Date(a.requestedAt || a.createdAt) - new Date(b.requestedAt || b.createdAt)
                );

                const processedRequests = [];
                const yearCounts = {};

                for (const req of sortedRequests) {
                    // Extract year from fromDate or use existing year field
                    let year;
                    if (req.fromDate) {
                        year = new Date(req.fromDate).getFullYear();
                    } else if (req.year) {
                        year = req.year;
                    } else {
                        console.log(`   ⚠️  No year found for request ${req.requestId}, skipping...`);
                        continue;
                    }

                    if (!yearCounts[year]) {
                        yearCounts[year] = 0;
                    }

                    // 1st request in year = FREE, 2nd+ = PAID
                    const isPaid = yearCounts[year] > 0;
                    yearCounts[year]++;

                    // Create dateRangeDisplay if missing
                    let dateRangeDisplay = req.dateRangeDisplay;
                    if (!dateRangeDisplay && req.fromDate && req.toDate) {
                        dateRangeDisplay = formatDateRange(req.fromDate, req.toDate);
                    } else if (!dateRangeDisplay && req.month && req.year) {
                        dateRangeDisplay = `${req.month} ${req.year}`;
                    } else if (!dateRangeDisplay) {
                        dateRangeDisplay = 'Unknown Date Range';
                    }

                    processedRequests.push({
                        requestId: req.requestId || `FSR${Date.now()}${Math.floor(Math.random() * 1000)}`,
                        fromDate: req.fromDate || new Date(`${req.year}-01-01`),
                        toDate: req.toDate || new Date(`${req.year}-01-31`),
                        dateRangeDisplay: dateRangeDisplay,
                        year: year,
                        status: req.status || 'pending',
                        requestedAt: req.requestedAt || req.createdAt || new Date(),
                        isPaid: isPaid,
                        adminNotes: req.adminNotes || '',
                        sentDate: req.sentDate || null,
                        downloadUrl: req.downloadUrl || '',
                        processedBy: req.processedBy || null,
                        processedAt: req.processedAt || null,
                        emailSentToAdmin: req.emailSentToAdmin || false,
                        emailSentToClient: req.emailSentToClient || false,
                        statementSentEmail: req.statementSentEmail || false
                    });
                }

                // Check if client already exists in new collection
                let existingDoc = await FinancialStatementRequestNew.findOne({ clientId: clientId });

                if (existingDoc) {
                    // Merge requests (avoid duplicates)
                    const existingIds = new Set(existingDoc.requests.map(r => r.requestId));
                    const newRequests = processedRequests.filter(r => !existingIds.has(r.requestId));

                    if (newRequests.length > 0) {
                        existingDoc.requests.push(...newRequests);
                        await existingDoc.save();
                        console.log(`   ✅ Updated existing client ${clientId} with ${newRequests.length} new requests`);
                    } else {
                        console.log(`   ⏭️  Client ${clientId} already has all requests`);
                    }
                } else {
                    // Create new document
                    const newDoc = new FinancialStatementRequestNew({
                        clientId: clientId,
                        clientName: group.clientName,
                        clientEmail: group.clientEmail,
                        requests: processedRequests
                    });

                    await newDoc.save();
                    console.log(`   ✅ Created new document for client ${clientId} with ${processedRequests.length} requests`);
                }

                migratedCount++;
                totalRequestsMigrated += processedRequests.length;

            } catch (error) {
                console.error(`   ❌ Error processing client ${clientId}:`, error.message);
                errorCount++;
            }
        }

        // ========== STEP 6: Summary ==========
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Old documents processed: ${allOldDocs.length}`);
        console.log(`✅ Clients processed: ${migratedCount}`);
        console.log(`✅ Total requests migrated: ${totalRequestsMigrated}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('='.repeat(60));
        console.log('✅ Migration completed successfully!');

        // ========== STEP 7: Verify ==========
        console.log('\n🔍 Verifying migration...');
        const finalOldCount = await FinancialStatementRequest.countDocuments({});
        const finalNewCount = await FinancialStatementRequestNew.countDocuments({});

        const totalRequestsInNew = await FinancialStatementRequestNew.aggregate([
            { $unwind: '$requests' },
            { $count: 'total' }
        ]);

        console.log(`📊 Old collection remaining: ${finalOldCount} documents`);
        console.log(`📊 New collection: ${finalNewCount} documents`);
        console.log(`📊 Total requests in new structure: ${totalRequestsInNew.length > 0 ? totalRequestsInNew[0].total : 0}`);

        console.log('\n✅ Migration complete! You can now use the new collection.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

// ========== Helper function ==========
function formatDateRange(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${from.toLocaleDateString('en-IN', options)} - ${to.toLocaleDateString('en-IN', options)}`;
}

// ========== Run migration ==========
migrateToNew();