const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

router.post("/", configController.updateConfig); // Dùng chung 1 link để tạo/sửa
router.get("/", configController.getConfig);     // Lấy giá về xem

module.exports = router;