const Room = require("../models/Room");
const Invoice = require("../models/Invoice"); 
const Tenant = require("../models/Tenant");
// API: Thêm phòng mới
exports.createRoom = async (req, res) => {
  try {
    // 1. Lấy dữ liệu người dùng gửi lên
    const { name, basePrice, floor } = req.body;

    // 2. Kiểm tra xem phòng đã tồn tại chưa
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: "Tên phòng này đã tồn tại!" });
    }

    // 3. Tạo phòng mới
    const newRoom = new Room({
      name,
      basePrice,
      floor
    });

    // 4. Lưu vào Database
    await newRoom.save();

    res.status(201).json({
      success: true,
      message: "Tạo phòng thành công!",
      data: newRoom
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// API: Lấy danh sách tất cả phòng
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .sort({ name: 1 })
      .lean(); 

    const roomIds = rooms.map(room => room._id);
    const activeTenants = await Tenant.find({ room: { $in: roomIds }, hasLeft: false })
      .select("fullName phone room");

    const tenantMap = {};
    activeTenants.forEach(tenant => {
      const key = tenant.room.toString();
      if (!tenantMap[key]) tenantMap[key] = [];
      tenantMap[key].push({
        _id: tenant._id,
        fullName: tenant.fullName,
        phone: tenant.phone
      });
    });

    rooms.forEach(room => {
      room.currentTenants = tenantMap[room._id.toString()] || [];
      if (room.currentTenants.length === 0 && room.status !== "EMPTY") {
        room.status = "EMPTY";
      }
    });
    // .lean() giúp trả về object thuần để chúng ta dễ chèn thêm dữ liệu

    // Lặp qua từng phòng để tìm hóa đơn chưa thanh toán gần nhất
    for (let room of rooms) {
      if (room.status === "RENTED") {
        const unpaidInvoice = await Invoice.findOne({
          room: room._id,
          status: "UNPAID"
        }).sort({ createdAt: -1 }); // Lấy cái mới nhất

        if (unpaidInvoice) {
          room.unpaidBill = unpaidInvoice; // Gắn hóa đơn nợ vào thông tin phòng
        }
      }
    }

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách phòng" });
  }
};

// API: Cập nhật thông tin phòng
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, basePrice, floor } = req.body;
    
    await Room.findByIdAndUpdate(id, { name, basePrice, floor });
    
    res.json({ success: true, message: "Cập nhật phòng thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật phòng" });
  }
};

// API: Lấy chi tiết 1 phòng theo ID
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).lean();

    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    const tenants = await Tenant.find({ room: id, hasLeft: false }).select("fullName phone");
    room.currentTenants = tenants;

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết phòng" });
  }
};