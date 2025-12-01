const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register); // Chỉ dùng để tạo nick ban đầu
router.post("/login", authController.login);

module.exports = router;