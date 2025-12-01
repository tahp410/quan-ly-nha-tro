// src/pages/RoomList.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import BillModal from "../components/BillModal";
import TenantModal from "../components/TenantModal";
import CreateRoomModal from "../components/CreateRoomModal";
import ConfigModal from "../components/ConfigModal";
import { useNavigate } from "react-router-dom";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Lấy tên user từ localStorage để hiển thị
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // State quản lý các Modal
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await axiosClient.get("/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Hàm Đăng Xuất
  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleMainAction = (room) => {
    if (room.status === "RENTED" && (room.currentTenants?.length || 0) === 0) {
      alert("Phòng này chưa có khách đang ở. Hãy thêm khách trước khi tính tiền.");
      return;
    }
    setSelectedRoom(room);
    if (room.status === "RENTED") {
      setIsBillModalOpen(true);
    } else {
      setIsTenantModalOpen(true);
    }
  };

  const handleAddTenant = (room) => {
    setSelectedRoom(room);
    setIsTenantModalOpen(true);
  };

  const handlePay = async (invoiceId) => {
    if (window.confirm("Xác nhận khách đã đóng tiền đầy đủ?")) {
      try {
        await axiosClient.put(`/invoices/${invoiceId}/pay`);
        alert("Đã cập nhật trạng thái: ĐÃ THANH TOÁN!");
        fetchRooms();
      } catch (error) {
        alert("Lỗi cập nhật thanh toán!");
      }
    }
  };

  const handleCheckout = async (room) => {
    if (window.confirm(`Bạn có chắc chắn muốn làm thủ tục TRẢ PHÒNG cho ${room.name}?`)) {
        if(window.confirm("Hãy chắc chắn rằng khách đã thanh toán hết nợ cũ?")) {
             try {
                await axiosClient.post("/tenants/checkout", { roomId: room._id });
                alert("Trả phòng thành công!");
                fetchRooms();
             } catch (error) {
                alert("Lỗi: " + error.response?.data?.message);
             }
        }
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* HEADER CẢI TIẾN */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 max-w-6xl mx-auto gap-4">
        <div>
            <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
            🏡 Quản Lý Nhà Trọ
            </h1>
            <p className="text-sm text-gray-500 mt-1">Xin chào, <span className="font-bold text-gray-700">{user.username || "Admin"}</span> 👋</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
            {/* --- MỚI: Nút Xem Báo Cáo --- */}
            <button 
              onClick={() => navigate("/dashboard")}
              className="bg-purple-100 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg hover:bg-purple-200 text-sm font-bold shadow-sm"
            >
              📊 Báo Cáo
            </button>

            {/* Nút Cài Đặt */}
            <button 
              onClick={() => setIsConfigModalOpen(true)}
              className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm"
            >
              ⚙️ Cài Đặt
            </button>

            {/* Nút Thêm Phòng */}
            <button 
              onClick={() => setIsCreateRoomModalOpen(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 shadow-md text-sm font-bold"
            >
              + Phòng Mới
            </button>

            {/* Nút Đăng Xuất */}
            <button 
              onClick={handleLogout}
              className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 text-sm font-medium"
            >
              Đăng Xuất ➔
            </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between hover:shadow-lg transition duration-200 relative group"
            >
              {/* Header Card */}
              <div className="flex justify-between items-start mb-2">
                {/* --- MỚI: Tên phòng bấm vào được --- */}
                <h3 
                    onClick={() => navigate(`/room/${room._id}`)}
                    className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 underline decoration-dotted"
                    title="Bấm để xem chi tiết & lịch sử"
                >
                    {room.name}
                </h3>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    room.status === "RENTED"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {room.status === "RENTED" ? "Đã thuê" : "Trống"}
                </span>
              </div>

              {/* Thông tin chi tiết */}
              <div className="text-gray-500 text-sm mb-4 space-y-1">
                <p>Giá: <span className="font-medium text-gray-700">{room.basePrice.toLocaleString()} đ</span></p>
                <p>Khách: <span className="font-medium text-gray-700">{room.currentTenants?.length || 0} người</span></p>
              </div>

              {/* Logic Nút Bấm */}
              {room.unpaidBill ? (
                <div className="flex flex-col gap-2">
                   <div className="text-center text-xs text-red-600 font-bold bg-red-50 py-1 rounded border border-red-100 animate-pulse">
                       ⚠ Nợ: {room.unpaidBill.totalAmount.toLocaleString()} đ
                   </div>
                   <div className="flex gap-2">
                      <button
                          onClick={() => window.open(`/bill/${room.unpaidBill.accessKey}`, '_blank')}
                          className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium border border-gray-300"
                      >
                          Xem Bill
                      </button>
                      <button
                          onClick={() => handlePay(room.unpaidBill._id)}
                          className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium shadow-sm"
                      >
                          Đã Thu
                      </button>
                   </div>
                </div>
              ) : (
                <div className="space-y-2">
                    <button
                      onClick={() => handleMainAction(room)}
                      className={`w-full py-2 rounded-lg transition font-medium text-white shadow-sm flex items-center justify-center gap-2
                        ${
                          room.status === "RENTED"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-green-600 hover:bg-green-700"
                        }
                      `}
                    >
                      {room.status === "RENTED" ? <span>⚡ Tính Tiền</span> : <span>👤 Thêm Khách</span>}
                    </button>

                    {room.status === "RENTED" && (
                      <button
                        onClick={() => handleAddTenant(room)}
                        className="w-full py-2 rounded-lg border border-dashed border-green-400 text-green-600 hover:bg-green-50 text-sm font-medium"
                      >
                        + Thêm khách
                      </button>
                    )}

                    {/* Nút Trả Phòng */}
                    {room.status === "RENTED" && (
                        <button
                            onClick={() => handleCheckout(room)}
                            className="w-full py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition"
                        >
                            Trả phòng
                        </button>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- CÁC MODAL --- */}
      <BillModal isOpen={isBillModalOpen} room={selectedRoom} onClose={() => setIsBillModalOpen(false)} onSuccess={() => fetchRooms()} />
      <TenantModal isOpen={isTenantModalOpen} room={selectedRoom} onClose={() => setIsTenantModalOpen(false)} onSuccess={() => fetchRooms()} />
      <CreateRoomModal isOpen={isCreateRoomModalOpen} onClose={() => setIsCreateRoomModalOpen(false)} onSuccess={() => fetchRooms()} />
      <ConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
    </div>
  );
};

export default RoomList;