const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Định nghĩa các đường dẫn
router.post("/", roomController.createRoom); // Tạo phòng
router.get("/", roomController.getAllRooms); // Lấy danh sách phòng
router.get("/:id", roomController.getRoomById); // Lấy chi tiết 1 phòng
router.put("/:id", roomController.updateRoom); 
module.exports = router;