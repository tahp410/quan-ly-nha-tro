require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

app.use(express.json());
app.use(cors());

// Route công khai: Xem hóa đơn bằng key (không cần đăng nhập)
app.get("/api/invoices/:key", require("./controllers/invoiceController").getInvoiceByKey);

// Các route bắt buộc đăng nhập (JWT)
app.use("/api/rooms", authMiddleware, require("./routes/roomRoutes"));
app.use("/api/tenants", authMiddleware, require("./routes/tenantRoutes"));
app.use("/api/config", authMiddleware, require("./routes/configRoutes"));
app.use("/api/invoices", authMiddleware, require("./routes/invoiceRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", authMiddleware, require("./routes/dashboardRoutes"));
 
connectDB();

app.get("/", (req, res) => {
  res.send("<h1>API Quản lý nhà trọ (MERN Stack) đang chạy...</h1>");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});