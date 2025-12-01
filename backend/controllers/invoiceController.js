const Invoice = require("../models/Invoice");
const Room = require("../models/Room");
const Config = require("../models/Config");
const Tenant = require("../models/Tenant");

// API: Tính tiền & Tạo hóa đơn
exports.createInvoice = async (req, res) => {
  try {
    // Nhận dữ liệu: ID phòng, Tháng, Chỉ số mới
    const { roomId, month, newElec, newWater, additionalFees, tenantId } = req.body;

    // 1. Lấy thông tin cần thiết từ DB
    const room = await Room.findById(roomId);
    const config = await Config.findOne({ isActive: true });

    // Validate (Kiểm tra lỗi)
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
    if (!config) return res.status(400).json({ message: "Chưa cài bảng giá điện nước! Hãy cài đặt trước." });

    let invoiceTenant = null;
    if (tenantId) {
      invoiceTenant = await Tenant.findById(tenantId);
      if (!invoiceTenant || invoiceTenant.hasLeft || invoiceTenant.room.toString() !== roomId) {
        return res.status(400).json({ message: "Thông tin khách đại diện không hợp lệ." });
      }
    } else {
      invoiceTenant = await Tenant.findOne({ room: roomId, hasLeft: false });
    }

    if (!invoiceTenant) {
      return res.status(400).json({ message: "Phòng này đang trống, không thể tính tiền!" });
    }

    // 2. Lấy chỉ số cũ (Từ dữ liệu phòng)
    const oldElec = room.lastReadings.electricity;
    const oldWater = room.lastReadings.water;

    // Kiểm tra số mới phải lớn hơn số cũ
    if (newElec < oldElec || newWater < oldWater) {
      return res.status(400).json({ message: "Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ!" });
    }

    // 3. TÍNH TOÁN TIỀN (Core Logic)
    const elecUsage = newElec - oldElec;
    const waterUsage = newWater - oldWater;

    const elecCost = elecUsage * config.electricityPrice;
    const waterCost = waterUsage * config.waterPrice;

    // Tính tổng tiền dịch vụ (Wifi, Rác...)
    let servicesCost = 0;
    const serviceSnapshots = (config.serviceFees || []).map(s => ({
      name: s.name,
      price: s.price
    }));
    serviceSnapshots.forEach(s => servicesCost += s.price);

    // Tổng tiền phải trả = Tiền phòng + Điện + Nước + Dịch vụ + Phụ phí
    const totalAmount = room.basePrice + elecCost + waterCost + servicesCost + (additionalFees || 0);

    // 4. Lưu Hóa Đơn (SNAPSHOT DATA)
    const newInvoice = new Invoice({
      room: roomId,
      tenant: invoiceTenant._id,
      month: month,
      
      // Lưu chi tiết điện
      electricity: {
        old: oldElec,
        new: newElec,
        usage: elecUsage,
        priceSnapshot: config.electricityPrice, // Lưu giá lúc này
        total: elecCost
      },
      
      // Lưu chi tiết nước
      water: {
        old: oldWater,
        new: newWater,
        usage: waterUsage,
        priceSnapshot: config.waterPrice,
        total: waterCost
      },

      services: serviceSnapshots, // Lưu snapshot danh sách dịch vụ lúc này
      roomPriceSnapshot: room.basePrice, 
      additionalFees: additionalFees || 0,
      totalAmount: totalAmount
    });

    await newInvoice.save();

    // 5. CẬP NHẬT LẠI PHÒNG (Để tháng sau dùng số mới này làm số cũ)
    room.lastReadings.electricity = newElec;
    room.lastReadings.water = newWater;
    await room.save();

    res.status(201).json({ success: true, message: "Lập hóa đơn thành công!", data: newInvoice });

  } catch (error) {
    res.status(500).json({ message: "Lỗi tính tiền", error: error.message });
  }
};

exports.getInvoiceByKey = async (req, res) => {
  try {
    const { key } = req.params;

    // Tìm hóa đơn theo accessKey, đồng thời lấy luôn thông tin Phòng và Khách
    const invoice = await Invoice.findOne({ accessKey: key })
      .populate("room", "name") // Lấy tên phòng
      .populate("tenant", "fullName phone"); // Lấy tên và sđt khách

    if (!invoice) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại hoặc đường dẫn sai!" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};
// API: Xác nhận đã thanh toán
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params; // ID của hóa đơn

    // Cập nhật status thành PAID
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { status: "PAID", paymentDate: new Date() },
      { new: true } // Trả về dữ liệu mới sau khi update
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }

    res.json({ success: true, message: "Đã xác nhận thanh toán!", data: updatedInvoice });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// API: Lấy lịch sử hóa đơn của một phòng cụ thể
exports.getRoomHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    // Tìm hóa đơn của phòng đó, sắp xếp mới nhất lên đầu
    const invoices = await Invoice.find({ room: roomId })
      .sort({ createdAt: -1 }) 
      .populate("tenant", "fullName"); // Lấy thêm tên người ở lúc đó
    
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy lịch sử" });
  }
};

// API: Lấy hóa đơn theo tháng (để filter dashboard)
exports.getInvoicesByMonth = async (req, res) => {
  try {
    const { month } = req.query; // Format: "12/2024" hoặc "2024-12"
    
    if (!month) {
      return res.status(400).json({ message: "Thiếu tham số month" });
    }

    // Tìm tất cả hóa đơn của tháng đó
    const invoices = await Invoice.find({ month })
      .populate("room", "name")
      .populate("tenant", "fullName")
      .sort({ createdAt: -1 });
    
    res.json(invoices);
  } catch (error) {
    console.error("Error getting invoices by month:", error);
    res.status(500).json({ message: "Lỗi lấy hóa đơn", error: error.message });
  }
};

// API: Thống kê thanh toán theo tháng (cho Dashboard)
exports.getPaymentSummaryByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Thiếu tham số month hoặc year" });
    }

    // Trên hóa đơn, trường `month` đang được lưu dạng "MM/YYYY"
    // Frontend gửi lên `month` (VD: "12") và `year` (VD: "2025"),
    // nên cần ghép lại đúng format đang lưu trong DB để query chính xác.
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const monthKey = `${String(monthNum).padStart(2, "0")}/${yearNum}`;

    const invoices = await Invoice.find({ month: monthKey })
      .populate("room", "name _id basePrice")
      .populate("tenant", "fullName");

    // Nhóm theo phòng, tính tổng & trạng thái thanh toán
    const summary = {};
    
    invoices.forEach(inv => {
      const roomId = inv.room._id.toString();
      if (!summary[roomId]) {
        summary[roomId] = {
          roomId: inv.room._id,
          roomName: inv.room.name,
          basePrice: inv.room.basePrice,
          tenantName: inv.tenant?.fullName || "N/A",
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          isPaid: false,
          invoices: []
        };
      }
      summary[roomId].totalAmount += inv.totalAmount;
      summary[roomId].paidAmount += inv.status === "PAID" ? inv.totalAmount : 0;
      summary[roomId].unpaidAmount += inv.status === "UNPAID" ? inv.totalAmount : 0;
      summary[roomId].isPaid = inv.status === "PAID"; // Cập nhật trạng thái
      summary[roomId].invoices.push({
        _id: inv._id,
        monthYear: inv.month, // Trả về chuỗi tháng/năm đang lưu, VD: "12/2025"
        status: inv.status,
        totalAmount: inv.totalAmount,
        accessKey: inv.accessKey
      });
    });

    res.json(Object.values(summary));
  } catch (error) {
    console.error("Error getting payment summary:", error);
    res.status(500).json({ message: "Lỗi lấy thống kê", error: error.message });
  }
};