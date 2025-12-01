const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

router.post("/create", invoiceController.createInvoice);
router.get("/by-month", invoiceController.getInvoicesByMonth);
router.get("/summary/month", invoiceController.getPaymentSummaryByMonth);
router.get("/:key", invoiceController.getInvoiceByKey);
router.put("/:id/pay", invoiceController.updatePaymentStatus);
router.get("/room/:roomId", invoiceController.getRoomHistory);
module.exports = router;