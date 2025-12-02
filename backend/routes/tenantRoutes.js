const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");

router.post("/", tenantController.addTenant);
router.post("/checkout", tenantController.checkoutTenant);
router.post("/:tenantId/checkout", tenantController.checkoutSingleTenant);
router.get("/room/:roomId", tenantController.getRoomTenants);
router.get("/", tenantController.getAllTenants); // Lấy tất cả tenants với filter
module.exports = router;