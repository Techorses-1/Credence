const mongoose = require('mongoose');
const FinancialStatementRequest = require('../models/FinancialStatementRequest'); // OLD
const FinancialStatementRequestNew = require('../models/FinancialStatementRequestNew'); // NEW

// ============================================
// DIRECT CONNECTION STRING
// ============================================
const MONGO_URI = "mongodb://admin:Admin%402025@93.127.167.226:27017/credencemain210526?authSource=admin&authMechanism=SCRAM-SHA-256";

// ============================================
// TEST MIGRATION SCRIPT - DRY RUN
// NO DATABASE CHANGES - ONLY LOGS!
// Run: node scripts/testMigration.js
// ============================================

const testMigration = async () => {
    try {
        console.log('🧪 STARTING TEST MIGRATION (DRY RUN)...');
        console.log('⚠️  THIS WILL NOT MODIFY THE DATABASE!');
        console.log('📋 Only showing what would happen...\n');

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

        // ========== STEP 2: Get sample of old data ==========
        console.log('📊 STEP 2: Getting sample of old data...');
        const sampleOld = await FinancialStatementRequest.find({})
            .limit(5)
            .lean();

        console.log(`   📋 Found ${sampleOld.length} sample documents`);
        if (sampleOld.length > 0) {
            console.log('   📄 Sample document structure:');
            console.log(`      - Fields: ${Object.keys(sampleOld[0]).join(', ')}`);
            console.log(`      - Example clientId: ${sampleOld[0].clientId}`);
            console.log(`      - Example requestId: ${sampleOld[0].requestId}`);
            console.log(`      - Example fromDate: ${sampleOld[0].fromDate}`);
            console.log(`      - Example status: ${sampleOld[0].status}`);
        }
        console.log('   ✅ Sample complete\n');

        // ========== STEP 3: Group by clientId ==========
        console.log('📊 STEP 3: Grouping old documents by clientId...');
        const allOldDocs = await FinancialStatementRequest.find({}).lean();

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
        console.log(`   👥 Found ${totalClients} unique clients`);
        console.log(`   📊 Total requests: ${allOldDocs.length}`);
        console.log('   ✅ Grouping complete\n');

        // ========== STEP 4: Show sample of grouped data ==========
        console.log('📊 STEP 4: Sample of grouped data...');
        let sampleCount = 0;
        for (const [clientId, group] of Object.entries(clientGroups)) {
            if (sampleCount >= 3) break;

            console.log(`\n   👤 Client: ${clientId}`);
            console.log(`      - Name: ${group.clientName}`);
            console.log(`      - Email: ${group.clientEmail}`);
            console.log(`      - Total requests: ${group.requests.length}`);

            // Show request details
            const sortedRequests = group.requests.sort(
                (a, b) => new Date(a.requestedAt || a.createdAt) - new Date(b.requestedAt || b.createdAt)
            );

            const yearCounts = {};
            console.log(`      - Requests:`);
            sortedRequests.forEach((req, index) => {
                const year = new Date(req.fromDate).getFullYear();
                if (!yearCounts[year]) yearCounts[year] = 0;
                const isPaid = yearCounts[year] > 0;
                yearCounts[year]++;

                console.log(`         ${index + 1}. ${req.requestId} | ${req.dateRangeDisplay || 'N/A'} | Year: ${year} | ${isPaid ? '💰 PAID' : '✅ FREE'}`);
            });

            sampleCount++;
        }
        console.log('\n   ✅ Sample complete\n');

        // ========== STEP 5: Show summary by year ==========
        console.log('📊 STEP 5: Summary by year...');
        const yearSummary = {};
        allOldDocs.forEach(doc => {
            const year = new Date(doc.fromDate).getFullYear();
            if (!yearSummary[year]) yearSummary[year] = 0;
            yearSummary[year]++;
        });

        console.log('   📅 Requests by year:');
        Object.keys(yearSummary)
            .sort()
            .forEach(year => {
                console.log(`      - ${year}: ${yearSummary[year]} requests`);
            });
        console.log('   ✅ Summary complete\n');

        // ========== STEP 6: Show clients with multiple requests ==========
        console.log('📊 STEP 6: Clients with multiple requests...');
        const multiRequestClients = Object.entries(clientGroups)
            .filter(([_, group]) => group.requests.length > 1)
            .sort((a, b) => b[1].requests.length - a[1].requests.length);

        if (multiRequestClients.length > 0) {
            console.log(`   👥 Found ${multiRequestClients.length} clients with multiple requests:`);
            multiRequestClients.slice(0, 5).forEach(([clientId, group]) => {
                console.log(`      - ${clientId}: ${group.requests.length} requests`);
            });
            if (multiRequestClients.length > 5) {
                console.log(`      - ... and ${multiRequestClients.length - 5} more`);
            }
        } else {
            console.log('   👥 No clients with multiple requests');
        }
        console.log('   ✅ Complete\n');

        // ========== STEP 7: Show what will be created ==========
        console.log('📊 STEP 7: What will be created...');
        console.log(`   📁 Will create ${totalClients} new documents in 'FinancialStatementRequestNew' collection`);
        console.log(`   📊 Will contain ${allOldDocs.length} total requests across all clients`);
        console.log(`   💰 1st request per year will be marked as FREE`);
        console.log(`   💰 2nd+ request per year will be marked as PAID`);
        console.log('   ✅ Plan complete\n');

        // ========== STEP 8: Show sample of new structure ==========
        console.log('📊 STEP 8: Sample of NEW structure...');
        console.log('   📄 New document structure:');
        console.log(`
   {
     clientId: "CLT123",
     clientName: "John Doe",
     clientEmail: "john@email.com",
     requests: [
       {
         requestId: "FSR001",
         fromDate: ISODate("2026-01-01"),
         toDate: ISODate("2026-03-26"),
         dateRangeDisplay: "1 Jan 2026 - 26 Mar 2026",
         year: 2026,
         status: "pending",
         requestedAt: ISODate("2026-01-15"),
         isPaid: false,  // ← 1st request = FREE
         // ... other fields
       },
       {
         requestId: "FSR002",
         fromDate: ISODate("2026-04-01"),
         toDate: ISODate("2026-05-31"),
         dateRangeDisplay: "1 Apr 2026 - 31 May 2026",
         year: 2026,
         status: "approved",
         requestedAt: ISODate("2026-04-10"),
         isPaid: true,   // ← 2nd request = PAID
         // ... other fields
       }
     ]
   }
   `);
        console.log('   ✅ Structure sample complete\n');

        // ========== STEP 9: Migration plan summary ==========
        console.log('='.repeat(60));
        console.log('📋 MIGRATION PLAN SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Old documents to migrate: ${allOldDocs.length}`);
        console.log(`✅ New documents to create: ${totalClients}`);
        console.log(`✅ Clients with multiple requests: ${Object.values(clientGroups).filter(g => g.requests.length > 1).length}`);
        console.log(`✅ Clients with single request: ${Object.values(clientGroups).filter(g => g.requests.length === 1).length}`);
        console.log(`✅ Year range: ${Math.min(...Object.keys(yearSummary))} - ${Math.max(...Object.keys(yearSummary))}`);
        console.log('='.repeat(60));
        console.log('\n⚠️  REMEMBER: This was a DRY RUN!');
        console.log('✅ No changes were made to the database!');
        console.log('📋 To perform actual migration, run: node scripts/migrateToNew.js');
        console.log('\n✅ Test completed successfully!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
};

// Run test
testMigration();