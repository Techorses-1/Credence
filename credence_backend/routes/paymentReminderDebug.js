const express = require("express");
const Client = require("../models/Client");

const router = express.Router();

/* ===============================
   DEBUG PAYMENT REMINDER
   DOES NOT SEND EMAILS
================================ */
router.get("/debug-active-clients", async (req, res) => {
    try {

        console.log("\n===============================");
        console.log("PAYMENT REMINDER DEBUG");
        console.log("===============================\n");

        // EXACT SAME QUERY AS YOUR CRON
        const activeClients = await Client.find({
            isActive: true
        });

        console.log(`Total Active Clients: ${activeClients.length}\n`);

        activeClients.forEach((client, index) => {

            console.log("--------------------------------");
            console.log(`Client #${index + 1}`);
            console.log("--------------------------------");
            console.log("Client ID      :", client.clientId);
            console.log("Name           :", client.firstName, client.lastName);
            console.log("Business       :", client.businessName);
            console.log("Email          :", client.email);
            console.log("isActive       :", client.isActive);
            console.log("Current Plan   :", client.currentPlan);
            console.log("Plan Selected  :", client.planSelected);
            console.log("Deactivated At :", client.deactivatedAt);
            console.log("Updated At     :", client.updatedAt);
            console.log("");
        });

        res.json({
            success: true,
            totalClients: activeClients.length,
            clients: activeClients.map(client => ({
                clientId: client.clientId,
                name: `${client.firstName} ${client.lastName}`,
                businessName: client.businessName,
                email: client.email,
                isActive: client.isActive,
                deactivatedAt: client.deactivatedAt,
                updatedAt: client.updatedAt
            }))
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }
});

module.exports = router;