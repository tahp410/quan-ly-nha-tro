const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    // Dừng chương trình nếu không kết nối được DB
    process.exit(1);
  }
};

module.exports = connectDB;