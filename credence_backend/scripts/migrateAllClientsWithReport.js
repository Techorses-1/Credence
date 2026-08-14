// migrateAllClientsWithReport.js - FINAL MIGRATION SCRIPT WITH REPORT
// This script migrates ALL boolean paymentStatus to strings and generates a detailed report

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = "mongodb://admin:Admin%402025@93.127.167.226:27017/credencemain210526?authSource=admin&authMechanism=SCRAM-SHA-256";

// SET THIS TO false FOR ACTUAL MIGRATION
const DRY_RUN = false;  // false = actually update all clients

// Create reports folder if not exists
const reportsDir = path.join(__dirname, '../migration_reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Generate timestamp for report
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportFile = path.join(reportsDir, `migration_report_${timestamp}.json`);

async function migrateAllClientsWithReport() {
  const report = {
    timestamp: new Date().toISOString(),
    mode: DRY_RUN ? 'DRY_RUN (No changes made)' : 'LIVE (Changes applied)',
    summary: {
      totalFieldsMigrated: 0,
      oldCollectionPaymentStatus: 0,
      oldCollectionHistory: 0,
      newCollectionPaymentStatus: 0,
      newCollectionHistory: 0,
      clientsAffected: [],
      errors: []
    },
    details: {
      oldCollection: [],
      newCollection: []
    }
  };

  try {
    console.log('\n🔵 =========================================');
    console.log('🔵 FULL MIGRATION WITH REPORT - ALL CLIENTS');
    console.log(DRY_RUN ? '🔵 DRY RUN MODE - No changes will be made' : '🔵 LIVE MODE - Changes WILL be made');
    console.log('🔵 =========================================\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database\n');

    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    const monthlyCollection = db.collection('clientmonthlydatas');

    let totalChanges = 0;
    let oldPaymentStatusChanges = 0;
    let oldHistoryChanges = 0;
    let newPaymentStatusChanges = 0;
    let newHistoryChanges = 0;

    // ============================================
    // PART 1: UPDATE OLD COLLECTION (clients.documents)
    // ============================================
    console.log('📁 =========================================');
    console.log('📁 PART 1: Migrating OLD collection (clients.documents)');
    console.log('📁 =========================================\n');
    
    const allClients = await clientsCollection.find({}).toArray();
    console.log(`📊 Total clients in database: ${allClients.length}\n`);
    
    for (const client of allClients) {
      if (!client.documents || Object.keys(client.documents).length === 0) continue;
      
      let clientModified = false;
      let clientPaymentChanges = 0;
      let clientHistoryChanges = 0;
      const clientAffectedMonths = [];
      
      for (const yearKey in client.documents) {
        for (const monthKey in client.documents[yearKey]) {
          const month = client.documents[yearKey][monthKey];
          
          // Convert paymentStatus
          if (month && typeof month.paymentStatus === 'boolean') {
            const oldValue = month.paymentStatus;
            const newValue = oldValue === true ? 'paid' : 'pending';
            
            if (!DRY_RUN) {
              client.documents[yearKey][monthKey].paymentStatus = newValue;
              clientModified = true;
            }
            
            clientPaymentChanges++;
            oldPaymentStatusChanges++;
            clientAffectedMonths.push(`${yearKey}-${monthKey} (paymentStatus: ${oldValue} → ${newValue})`);
          }
          
          // Convert paymentHistory status
          if (month && month.paymentHistory && month.paymentHistory.length > 0) {
            for (let i = 0; i < month.paymentHistory.length; i++) {
              if (typeof month.paymentHistory[i].status === 'boolean') {
                const oldHistoryValue = month.paymentHistory[i].status;
                const newHistoryValue = oldHistoryValue === true ? 'paid' : 'pending';
                
                if (!DRY_RUN) {
                  client.documents[yearKey][monthKey].paymentHistory[i].status = newHistoryValue;
                  clientModified = true;
                }
                
                clientHistoryChanges++;
                oldHistoryChanges++;
              }
            }
          }
        }
      }
      
      if (clientPaymentChanges > 0 || clientHistoryChanges > 0) {
        console.log(`\n✅ Client: ${client.clientId} (${client.name || 'Unknown'})`);
        console.log(`   📍 PaymentStatus fields: ${clientPaymentChanges}`);
        console.log(`   📜 History fields: ${clientHistoryChanges}`);
        console.log(`   📅 Affected months: ${clientAffectedMonths.join(', ')}`);
        
        report.summary.clientsAffected.push({
          clientId: client.clientId,
          clientName: client.name || 'Unknown',
          email: client.email || 'Unknown',
          paymentStatusFields: clientPaymentChanges,
          historyFields: clientHistoryChanges,
          months: clientAffectedMonths
        });
        
        report.details.oldCollection.push({
          clientId: client.clientId,
          clientName: client.name || 'Unknown',
          changes: {
            paymentStatus: clientPaymentChanges,
            history: clientHistoryChanges,
            months: clientAffectedMonths
          }
        });
      }
      
      if (!DRY_RUN && clientModified) {
        await clientsCollection.updateOne(
          { _id: client._id },
          { $set: { documents: client.documents } }
        );
      }
    }
    
    console.log(`\n📊 OLD COLLECTION SUMMARY:`);
    console.log(`   ✅ PaymentStatus fields converted: ${oldPaymentStatusChanges}`);
    console.log(`   ✅ History fields converted: ${oldHistoryChanges}`);
    console.log(`   📦 Total: ${oldPaymentStatusChanges + oldHistoryChanges}\n`);

    // ============================================
    // PART 2: UPDATE NEW COLLECTION (clientmonthlydatas)
    // ============================================
    console.log('📁 =========================================');
    console.log('📁 PART 2: Migrating NEW collection (clientmonthlydatas)');
    console.log('📁 =========================================\n');
    
    const allMonthlyDocs = await monthlyCollection.find({}).toArray();
    console.log(`📊 Total documents in new collection: ${allMonthlyDocs.length}\n`);
    
    for (const doc of allMonthlyDocs) {
      if (!doc.months || doc.months.length === 0) continue;
      
      let docModified = false;
      let docPaymentChanges = 0;
      let docHistoryChanges = 0;
      const affectedMonths = [];
      
      for (let i = 0; i < doc.months.length; i++) {
        const month = doc.months[i];
        
        // Convert paymentStatus
        if (typeof month.paymentStatus === 'boolean') {
          const oldValue = month.paymentStatus;
          const newValue = oldValue === true ? 'paid' : 'pending';
          
          if (!DRY_RUN) {
            doc.months[i].paymentStatus = newValue;
            docModified = true;
          }
          
          docPaymentChanges++;
          newPaymentStatusChanges++;
          affectedMonths.push(`${month.year}-${month.month} (paymentStatus: ${oldValue} → ${newValue})`);
        }
        
        // Convert paymentHistory
        if (month.paymentHistory && month.paymentHistory.length > 0) {
          for (let j = 0; j < month.paymentHistory.length; j++) {
            if (typeof month.paymentHistory[j].status === 'boolean') {
              const oldHistoryValue = month.paymentHistory[j].status;
              const newHistoryValue = oldHistoryValue === true ? 'paid' : 'pending';
              
              if (!DRY_RUN) {
                doc.months[i].paymentHistory[j].status = newHistoryValue;
                docModified = true;
              }
              
              docHistoryChanges++;
              newHistoryChanges++;
            }
          }
        }
      }
      
      if (docPaymentChanges > 0 || docHistoryChanges > 0) {
        console.log(`\n✅ Client: ${doc.clientId} (${doc.clientName || 'Unknown'})`);
        console.log(`   📍 PaymentStatus fields: ${docPaymentChanges}`);
        console.log(`   📜 History fields: ${docHistoryChanges}`);
        console.log(`   📅 Affected months: ${affectedMonths.join(', ')}`);
        
        report.details.newCollection.push({
          clientId: doc.clientId,
          clientName: doc.clientName || 'Unknown',
          clientEmail: doc.clientEmail || 'Unknown',
          changes: {
            paymentStatus: docPaymentChanges,
            history: docHistoryChanges,
            months: affectedMonths
          }
        });
      }
      
      if (!DRY_RUN && docModified) {
        await monthlyCollection.updateOne(
          { _id: doc._id },
          { $set: { months: doc.months } }
        );
      }
    }
    
    console.log(`\n📊 NEW COLLECTION SUMMARY:`);
    console.log(`   ✅ PaymentStatus fields converted: ${newPaymentStatusChanges}`);
    console.log(`   ✅ History fields converted: ${newHistoryChanges}`);
    console.log(`   📦 Total: ${newPaymentStatusChanges + newHistoryChanges}\n`);

    // ============================================
    // FINAL SUMMARY
    // ============================================
    totalChanges = oldPaymentStatusChanges + oldHistoryChanges + newPaymentStatusChanges + newHistoryChanges;
    
    report.summary.totalFieldsMigrated = totalChanges;
    report.summary.oldCollectionPaymentStatus = oldPaymentStatusChanges;
    report.summary.oldCollectionHistory = oldHistoryChanges;
    report.summary.newCollectionPaymentStatus = newPaymentStatusChanges;
    report.summary.newCollectionHistory = newHistoryChanges;
    
    console.log('🔵 =========================================');
    console.log('🔵 FINAL MIGRATION SUMMARY');
    console.log('🔵 =========================================');
    console.log(`\n📊 TOTAL FIELDS PROCESSED: ${totalChanges}`);
    console.log(`\n   📁 OLD COLLECTION (clients.documents):`);
    console.log(`      - PaymentStatus: ${oldPaymentStatusChanges}`);
    console.log(`      - History: ${oldHistoryChanges}`);
    console.log(`      - Subtotal: ${oldPaymentStatusChanges + oldHistoryChanges}`);
    console.log(`\n   📁 NEW COLLECTION (clientmonthlydatas):`);
    console.log(`      - PaymentStatus: ${newPaymentStatusChanges}`);
    console.log(`      - History: ${newHistoryChanges}`);
    console.log(`      - Subtotal: ${newPaymentStatusChanges + newHistoryChanges}`);
    console.log(`\n   👥 Clients affected: ${report.summary.clientsAffected.length}`);
    
    if (DRY_RUN) {
      console.log('\n⚠️ DRY RUN MODE - No actual changes were made');
      console.log('✅ To apply changes, set DRY_RUN = false and run again');
      report.mode = 'DRY_RUN (No changes made)';
    } else {
      console.log('\n✅ FULL MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('✅ All boolean paymentStatus converted to strings');
      console.log(`✅ Report saved to: ${reportFile}`);
      report.mode = 'LIVE (Changes applied)';
    }
    
    // Save report to file
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved at: ${reportFile}`);
    
    // Print summary of affected clients
    if (report.summary.clientsAffected.length > 0) {
      console.log('\n📋 AFFECTED CLIENTS SUMMARY:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      report.summary.clientsAffected.forEach(client => {
        console.log(`\n👤 ${client.clientName} (${client.clientId})`);
        console.log(`   📧 ${client.email}`);
        console.log(`   📍 PaymentStatus: ${client.paymentStatusFields}`);
        console.log(`   📜 History: ${client.historyFields}`);
        console.log(`   📅 Months: ${client.months.join(', ')}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');

  } catch (error) {
    console.error('❌ ERROR:', error);
    report.summary.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Save error report
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n❌ Error report saved at: ${reportFile}`);
    
    await mongoose.disconnect();
  }
}

// RUN THE MIGRATION
migrateAllClientsWithReport();