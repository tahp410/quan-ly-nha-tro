const User = require("../models/User");
const jwt = require("jsonwebtoken");

// API: Đăng ký tài khoản (Dùng 1 lần để tạo nick Admin)
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Kiểm tra trùng tên
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Tài khoản đã tồn tại" });

    // Tạo user mới (Password sẽ tự mã hóa nhờ pre-save hook trong Model)
    const newUser = new User({ username, password, role: "ADMIN" });
    await newUser.save();

    res.json({ success: true, message: "Tạo tài khoản thành công!" });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// API: Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu!" });

    // 2. So sánh mật khẩu (Dùng hàm comparePassword đã viết trong Model)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu!" });

    // 3. Tạo Token (Cấp thẻ bài)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" } // Token sống 30 ngày (để bố mẹ đỡ phải đăng nhập lại nhiều)
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: { username: user.username, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};