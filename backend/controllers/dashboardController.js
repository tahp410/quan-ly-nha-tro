const Room = require("../models/Room");
const Tenant = require("../models/Tenant");
const Invoice = require("../models/Invoice");

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Thống kê số lượng
    const totalRooms = await Room.countDocuments();
    const emptyRooms = await Room.countDocuments({ status: "EMPTY" });
    const rentedRooms = await Room.countDocuments({ status: "RENTED" });
    // Đếm tổng số khách đang ở (Tenant chưa rời đi)
    const totalTenants = await Tenant.countDocuments({ hasLeft: false });

    // 2. Tài chính tháng này
    const date = new Date();
    const currentMonth = date.getMonth() + 1; // 1-12
    const currentYear = date.getFullYear();

    // Hệ thống đang lưu trường `month` trên hóa đơn ở dạng chuỗi "MM/YYYY"
    // nên khi query phải dùng đúng format này, nếu không sẽ luôn trả về rỗng.
    const monthKey = `${String(currentMonth).padStart(2, "0")}/${currentYear}`; // VD: "12/2025"

    const invoicesThisMonth = await Invoice.find({ month: monthKey });
    
    // Tổng doanh thu tháng này (Tính trên hóa đơn đã tạo)
    const revenueThisMonth = invoicesThisMonth.reduce((acc, curr) => acc + curr.totalAmount, 0);
    
    // Số tiền chưa thu được (Của tháng này)
    const unpaidThisMonth = invoicesThisMonth
      .filter(inv => inv.status === "UNPAID")
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({
      totalRooms,
      emptyRooms,
      rentedRooms,
      totalTenants,
      revenueThisMonth,
      unpaidThisMonth,
      currentMonth: monthKey,
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thống kê dashboard" });
  }
};