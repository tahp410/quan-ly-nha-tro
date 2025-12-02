const Tenant = require("../models/Tenant");
const Room = require("../models/Room");

// API: Thêm khách mới & Xếp vào phòng
exports.addTenant = async (req, res) => {
  try {
    const { fullName, phone, cccd, hometown, roomId, startDate } = req.body;

    // 1. Kiểm tra xem phòng có tồn tại không
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng này!" });
    }

    // 2. Tạo hồ sơ khách
    const newTenant = new Tenant({
      fullName,
      phone,
      cccd,
      hometown,
      room: roomId, // Liên kết khách với phòng
      startDate: startDate || Date.now()
    });

    // 3. Lưu khách vào Database
    const savedTenant = await newTenant.save();

    // 4. Cập nhật phòng: thêm khách vào danh sách hiện tại & đổi trạng thái
    room.currentTenants = room.currentTenants || [];
    room.currentTenants.push(savedTenant._id);
    room.status = "RENTED"; 
    await room.save();

    res.status(201).json({
      success: true,
      message: "Thêm khách thành công! Phòng đã thêm 1 người đang ở.",
      data: savedTenant
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// API: Trả phòng (Check-out)
exports.checkoutTenant = async (req, res) => {
  try {
    const { roomId } = req.body;

    // 1. Tìm phòng
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng!" });
    // 2. Đánh dấu tất cả khách hiện tại đã rời đi
    const activeTenants = await Tenant.find({ room: roomId, hasLeft: false }).select("_id");
    if (activeTenants.length === 0) {
      return res.status(400).json({ message: "Phòng này đang trống mà!" });
    }

    await Tenant.updateMany(
      { _id: { $in: activeTenants.map(t => t._id) } },
      { hasLeft: true, endDate: new Date() }
    );

    // 3. Reset phòng về trạng thái TRỐNG
    room.status = "EMPTY";
    room.currentTenants = [];
    // Lưu ý: Không reset lastReadings điện nước, để người sau vào ở tiếp tục dùng số đó làm số cũ
    
    await room.save();

    res.json({ success: true, message: "Trả phòng thành công! Phòng đã trống." });

  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// API: Cho 1 khách cụ thể rời phòng
exports.checkoutSingleTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant || tenant.hasLeft) {
      return res.status(404).json({ message: "Không tìm thấy khách hoặc khách đã rời đi." });
    }

    const room = await Room.findById(tenant.room);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng của khách này." });
    }

    tenant.hasLeft = true;
    tenant.endDate = new Date();
    await tenant.save();

    if (room.currentTenants && room.currentTenants.length > 0) {
      room.currentTenants = room.currentTenants.filter(
        (id) => id.toString() !== tenantId
      );
    }

    const remaining = await Tenant.countDocuments({ room: tenant.room, hasLeft: false });
    if (remaining === 0) {
      room.status = "EMPTY";
      room.currentTenants = [];
    } else {
      room.status = "RENTED";
    }
    await room.save();

    res.json({ success: true, message: "Đã cập nhật khách rời phòng." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// API: Lấy tất cả tenant của một phòng (cả current + history)
exports.getRoomTenants = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Tìm tất cả tenant liên kết với phòng này
    const tenants = await Tenant.find({ room: roomId })
      .sort({ startDate: -1 }); // Mới nhất lên đầu

    // Nhóm thành current & history
    const current = tenants.filter(t => !t.hasLeft);
    const history = tenants.filter(t => t.hasLeft);

    res.json({
      current,
      history
    });
  } catch (error) {
    console.error("Error getting room tenants:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách khách", error: error.message });
  }
};

// API: Lấy tất cả tenants với filter và search
exports.getAllTenants = async (req, res) => {
  try {
    const { 
      status,        // "current" | "left" | "all"
      roomId,        // ID phòng cụ thể
      search,        // Tìm kiếm theo tên, SĐT, quê quán
      startDateFrom, // Ngày vào từ
      startDateTo,   // Ngày vào đến
      endDateFrom,   // Ngày rời từ
      endDateTo      // Ngày rời đến
    } = req.query;

    // Xây dựng query
    let query = {};

    // Filter theo trạng thái
    if (status === "current") {
      query.hasLeft = false;
    } else if (status === "left") {
      query.hasLeft = true;
    }
    // Nếu status === "all" hoặc không có, lấy tất cả

    // Filter theo phòng
    if (roomId) {
      query.room = roomId;
    }

    // Filter theo ngày vào
    if (startDateFrom || startDateTo) {
      query.startDate = {};
      if (startDateFrom) {
        query.startDate.$gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        const toDate = new Date(startDateTo);
        toDate.setHours(23, 59, 59, 999); // Đến cuối ngày
        query.startDate.$lte = toDate;
      }
    }

    // Filter theo ngày rời
    if (endDateFrom || endDateTo) {
      query.endDate = {};
      if (endDateFrom) {
        query.endDate.$gte = new Date(endDateFrom);
      }
      if (endDateTo) {
        const toDate = new Date(endDateTo);
        toDate.setHours(23, 59, 59, 999);
        query.endDate.$lte = toDate;
      }
    }

    // Tìm kiếm theo tên, SĐT, quê quán
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { hometown: { $regex: search, $options: "i" } }
      ];
    }

    // Lấy dữ liệu với populate room
    const tenants = await Tenant.find(query)
      .populate("room", "name floor")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    // Tính số ngày ở cho mỗi tenant
    const tenantsWithDays = tenants.map(tenant => {
      const tenantObj = tenant.toObject();
      const startDate = new Date(tenant.startDate);
      let daysStayed = 0;

      if (tenant.hasLeft && tenant.endDate) {
        const endDate = new Date(tenant.endDate);
        daysStayed = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
      } else {
        // Nếu chưa rời, tính từ ngày vào đến hiện tại
        const now = new Date();
        daysStayed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      }

      tenantObj.daysStayed = daysStayed;
      return tenantObj;
    });

    res.json(tenantsWithDays);
  } catch (error) {
    console.error("Error getting all tenants:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách khách", error: error.message });
  }
};