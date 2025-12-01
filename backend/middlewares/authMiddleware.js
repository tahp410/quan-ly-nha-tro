const jwt = require("jsonwebtoken");

// Middleware kiểm tra JWT cho các API quản trị
module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Thiếu token, vui lòng đăng nhập lại." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};


