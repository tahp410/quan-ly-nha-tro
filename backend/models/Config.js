const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema(
  {
    electricityPrice: { type: Number, required: true, default: 3500 }, // Giá mặc định
    waterPrice: { type: Number, required: true, default: 20000 },
    
    serviceFees: [
      {
        name: String,
        price: Number
      }
    ],

    // Cờ đánh dấu cấu hình đang dùng
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", ConfigSchema);