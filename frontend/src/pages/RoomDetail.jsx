import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const RoomDetail = () => {
  const { id } = useParams(); // Lấy ID phòng từ URL
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [history, setHistory] = useState([]);
  const [tenants, setTenants] = useState({ current: [], history: [] });
  const [isEditing, setIsEditing] = useState(false);
  
  // State form sửa
  const [editForm, setEditForm] = useState({ name: "", basePrice: 0, floor: 1 });

  const loadData = async () => {
    try {
      // 1. Lấy info phòng (gọi thẳng theo ID để tối ưu)
      const resRoom = await axiosClient.get(`/rooms/${id}`); 
      const currentRoom = resRoom.data;
      setRoom(currentRoom);
      setEditForm({ 
        name: currentRoom.name, 
        basePrice: currentRoom.basePrice, 
        floor: currentRoom.floor 
      });

      // 2. Lấy lịch sử hóa đơn
      const resHistory = await axiosClient.get(`/invoices/room/${id}`);
      setHistory(resHistory.data);

      // 3. Lấy danh sách khách (current + history)
      const resTenants = await axiosClient.get(`/tenants/room/${id}`);
      setTenants(resTenants.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async () => {
    try {
      await axiosClient.put(`/rooms/${id}`, editForm);
      alert("Cập nhật thành công!");
      setIsEditing(false);
      const resRoom = await axiosClient.get(`/rooms/${id}`); 
      setRoom(resRoom.data);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert("Lỗi cập nhật");
    }
  };

  const handleSingleCheckout = async (tenantId, tenantName) => {
    if (!window.confirm(`Cho khách ${tenantName} rời phòng?`)) return;
    try {
      await axiosClient.post(`/tenants/${tenantId}/checkout`);
      alert("Đã cập nhật khách rời phòng!");
      loadData();
    } catch (err) {
      alert("Lỗi cập nhật khách: " + (err.response?.data?.message || "Server error"));
    }
  };

  if (!room) return <div>Đang tải...</div>;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <button onClick={() => navigate("/")} className="mb-4 text-blue-600 font-medium">← Quay lại</button>
      
      {/* KHỐI 1: THÔNG TIN PHÒNG & SỬA */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-blue-800">Thông tin phòng {room.name}</h1>
            <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-bold"
            >
                {isEditing ? "Hủy Sửa" : "✏️ Sửa Phòng"}
            </button>
        </div>

        {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-yellow-50 p-4 rounded border border-yellow-200">
                <input 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="border p-2 rounded" placeholder="Tên phòng"
                />
                <input 
                    type="number"
                    value={editForm.basePrice} 
                    onChange={(e) => setEditForm({...editForm, basePrice: e.target.value})}
                    className="border p-2 rounded" placeholder="Giá thuê"
                />
                <button onClick={handleUpdate} className="bg-blue-600 text-white p-2 rounded">Lưu Thay Đổi</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                <p><strong>Giá thuê:</strong> {room.basePrice.toLocaleString()} đ</p>
                <p><strong>Tầng:</strong> {room.floor}</p>
                <p><strong>Trạng thái:</strong> {room.status === "RENTED" ? "Đang có khách" : "Trống"}</p>
            </div>
        )}
      </div>

      {/* KHỐI 2: KHÁCH ĐANG Ở */}
      {tenants.current.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-green-500">
             <h2 className="text-xl font-bold text-gray-800 mb-3">👤 Khách Đang Ở ({tenants.current.length})</h2>
             {tenants.current.map(tenant => (
                <div key={tenant._id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 mb-4">
                    <p>Họ tên: <strong>{tenant.fullName}</strong></p>
                    <p>SĐT: <strong>{tenant.phone}</strong></p>
                    <p>CCCD: <strong>{tenant.cccd}</strong></p>
                    <p>Ngày vào: <strong>{new Date(tenant.startDate).toLocaleDateString('vi-VN')}</strong></p>
                    <p>Quê: <strong>{tenant.hometown || 'N/A'}</strong></p>
                    <div className="md:col-span-3 flex justify-end">
                      <button
                        onClick={() => handleSingleCheckout(tenant._id, tenant.fullName)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Cho khách rời phòng
                      </button>
                    </div>
                </div>
             ))}
        </div>
      )}

      {/* KHỐI 3: LỊCH SỬ KHÁCH ĐƯỚC Ở */}
      {tenants.history.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-orange-500">
             <h2 className="text-xl font-bold text-gray-800 mb-3">📜 Lịch Sử Khách Đã Rời Đi ({tenants.history.length})</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 uppercase">
                        <tr>
                            <th className="px-4 py-3">Họ Tên</th>
                            <th className="px-4 py-3">SĐT</th>
                            <th className="px-4 py-3">Ngày Vào</th>
                            <th className="px-4 py-3">Ngày Rời</th>
                            <th className="px-4 py-3">Thời Gian Ở</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.history.map(tenant => {
                            const startDate = new Date(tenant.startDate);
                            const endDate = tenant.endDate ? new Date(tenant.endDate) : null;
                            const daysStayed = endDate ? Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) : 0;
                            
                            const vietnamStartDate = startDate.toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            });
                            
                            const vietnamEndDate = endDate 
                              ? endDate.toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })
                              : '-';
                            
                            return (
                                <tr key={tenant._id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-bold">{tenant.fullName}</td>
                                    <td className="px-4 py-3">{tenant.phone}</td>
                                    <td className="px-4 py-3">{vietnamStartDate}</td>
                                    <td className="px-4 py-3">{vietnamEndDate}</td>
                                    <td className="px-4 py-3">{daysStayed} ngày</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
        </div>
      )}

      {/* KHỐI 4: LỊCH SỬ ĐÓNG TIỀN */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">💳 Lịch Sử Hóa Đơn Điện - Nước</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                    <tr>
                        <th className="px-4 py-3">Tháng</th>
                        <th className="px-4 py-3">Khách</th>
                        <th className="px-4 py-3">Điện (số)</th>
                        <th className="px-4 py-3">Nước (khối)</th>
                        <th className="px-4 py-3">Tổng Tiền</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Xem</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length === 0 && <tr><td colSpan="7" className="p-4 text-center">Chưa có lịch sử</td></tr>}
                    {history.map(inv => (
                        <tr key={inv._id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-bold">{inv.month}</td>
                            <td className="px-4 py-3 text-sm">{inv.tenant?.fullName || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-500">{inv.electricity.usage} số</td>
                            <td className="px-4 py-3 text-gray-500">{inv.water.usage} khối</td>
                            <td className="px-4 py-3 text-blue-600 font-bold">{inv.totalAmount.toLocaleString()} đ</td>
                            <td className="px-4 py-3">
                                {inv.status === "PAID" ? (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">✓ Đã Thu</span>
                                ) : (
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">⚠ Nợ</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <a href={`/bill/${inv.accessKey}`} target="_blank" className="text-blue-500 hover:underline">Xem Bill</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;