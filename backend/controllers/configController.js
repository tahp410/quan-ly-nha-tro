const Config = require("../models/Config");

// API: Tạo hoặc Cập nhật bảng giá
// Logic: Luôn chỉ giữ 1 bảng giá active, nếu có rồi thì update, chưa có thì tạo mới
exports.updateConfig = async (req, res) => {
  try {
    const { electricityPrice, waterPrice, serviceFees } = req.body;

    // Tìm xem đã có cấu hình nào chưa
    let config = await Config.findOne({ isActive: true });

    if (config) {
      // Nếu có rồi -> Cập nhật lại giá
      config.electricityPrice = electricityPrice;
      config.waterPrice = waterPrice;
      config.serviceFees = serviceFees;
      await config.save();
    } else {
      // Nếu chưa có -> Tạo mới
      config = new Config({
        electricityPrice,
        waterPrice,
        serviceFees,
        isActive: true
      });
      await config.save();
    }

    res.json({ success: true, message: "Cập nhật bảng giá thành công!", data: config });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// API: Lấy bảng giá để hiển thị lên giao diện
exports.getConfig = async (req, res) => {
  try {
    const config = await Config.findOne({ isActive: true });
    if (!config) return res.status(404).json({ message: "Chưa cấu hình giá!" });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};