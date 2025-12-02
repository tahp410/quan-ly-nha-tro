import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [history, setHistory] = useState([]);
  const [tenants, setTenants] = useState({ current: [], history: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("current"); // "current" | "history" | "invoices"
  
  const [editForm, setEditForm] = useState({ name: "", basePrice: 0, floor: 1 });

  const loadData = async () => {
    try {
      const resRoom = await axiosClient.get(`/rooms/${id}`); 
      const currentRoom = resRoom.data;
      setRoom(currentRoom);
      setEditForm({ 
        name: currentRoom.name, 
        basePrice: currentRoom.basePrice, 
        floor: currentRoom.floor 
      });

      const resHistory = await axiosClient.get(`/invoices/room/${id}`);
      setHistory(resHistory.data);

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

  // Phân loại hóa đơn: của khách đang ở vs khách cũ
  const currentTenantIds = tenants.current.map(t => t._id.toString());
  const invoicesCurrent = history.filter(inv => 
    inv.tenant && currentTenantIds.includes(inv.tenant._id?.toString() || inv.tenant.toString())
  );
  const invoicesHistory = history.filter(inv => 
    !inv.tenant || !currentTenantIds.includes(inv.tenant._id?.toString() || inv.tenant.toString())
  );

  if (!room) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <button onClick={() => navigate("/")} className="mb-4 text-blue-600 font-medium hover:underline">
        ← Quay lại
      </button>
      
      {/* THÔNG TIN PHÒNG */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-800">Thông tin phòng {room.name}</h1>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-bold hover:bg-yellow-200"
          >
            {isEditing ? "Hủy Sửa" : "✏️ Sửa Phòng"}
          </button>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-yellow-50 p-4 rounded border border-yellow-200">
            <input 
              value={editForm.name} 
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="border p-2 rounded focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Tên phòng"
            />
            <input 
              type="number"
              value={editForm.basePrice} 
              onChange={(e) => setEditForm({...editForm, basePrice: e.target.value})}
              className="border p-2 rounded focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Giá thuê"
            />
            <button 
              onClick={handleUpdate} 
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium"
            >
              Lưu Thay Đổi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
            <p><strong>Giá thuê:</strong> {room.basePrice.toLocaleString()} đ</p>
            <p><strong>Tầng:</strong> {room.floor}</p>
            <p><strong>Trạng thái:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                room.status === "RENTED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}>
                {room.status === "RENTED" ? "Đang có khách" : "Trống"}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("current")}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === "current"
                ? "bg-blue-600 text-white border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            👤 Người Thuê Hiện Tại ({tenants.current.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-blue-600 text-white border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            📜 Lịch Sử Khách ({tenants.history.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === "invoices"
                ? "bg-blue-600 text-white border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            💳 Hóa Đơn ({history.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: NGƯỜI THUÊ HIỆN TẠI */}
          {activeTab === "current" && (
            <div>
              {tenants.current.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">Phòng này đang trống</p>
                  <p className="text-sm">Chưa có người thuê hiện tại</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tenants.current.map(tenant => (
                    <div 
                      key={tenant._id} 
                      className="border border-green-200 bg-green-50 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Họ tên</p>
                          <p className="font-bold text-gray-800 text-lg">{tenant.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Số điện thoại</p>
                          <p className="font-semibold text-gray-700">{tenant.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">CCCD</p>
                          <p className="font-semibold text-gray-700">{tenant.cccd || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ngày vào ở</p>
                          <p className="font-semibold text-gray-700">
                            {new Date(tenant.startDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quê quán</p>
                          <p className="font-semibold text-gray-700">{tenant.hometown || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-3 border-t border-green-200">
                        <button
                          onClick={() => handleSingleCheckout(tenant._id, tenant.fullName)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm transition-colors"
                        >
                          Cho khách rời phòng
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LỊCH SỬ KHÁCH ĐÃ Ở */}
          {activeTab === "history" && (
            <div>
              {tenants.history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">Chưa có lịch sử</p>
                  <p className="text-sm">Chưa có khách nào rời phòng này</p>
                </div>
              ) : (
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
                            <td className="px-4 py-3">{tenant.phone || "N/A"}</td>
                            <td className="px-4 py-3">{vietnamStartDate}</td>
                            <td className="px-4 py-3">{vietnamEndDate}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                {daysStayed} ngày
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HÓA ĐƠN THANH TOÁN */}
          {activeTab === "invoices" && (
            <div className="space-y-8">
              {/* Hóa đơn của khách đang ở */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Đang ở</span>
                  Hóa đơn của khách đang ở ({invoicesCurrent.length})
                </h3>
                {invoicesCurrent.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <p>Chưa có hóa đơn của khách đang ở</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-green-50 text-gray-700">
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
                        {invoicesCurrent.map(inv => (
                          <tr key={inv._id} className="border-b hover:bg-green-50">
                            <td className="px-4 py-3 font-bold">{inv.month}</td>
                            <td className="px-4 py-3 text-sm font-semibold">{inv.tenant?.fullName || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-600">{inv.electricity?.usage || 0} số</td>
                            <td className="px-4 py-3 text-gray-600">{inv.water?.usage || 0} khối</td>
                            <td className="px-4 py-3 text-blue-600 font-bold">{inv.totalAmount?.toLocaleString() || 0} đ</td>
                            <td className="px-4 py-3">
                              {inv.status === "PAID" ? (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">✓ Đã Thu</span>
                              ) : (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">⚠ Nợ</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <a 
                                href={`/bill/${inv.accessKey}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                Xem Bill
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Hóa đơn của khách cũ */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">Đã rời</span>
                  Hóa đơn của khách cũ ({invoicesHistory.length})
                </h3>
                {invoicesHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <p>Chưa có hóa đơn của khách cũ</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-orange-50 text-gray-700">
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
                        {invoicesHistory.map(inv => (
                          <tr key={inv._id} className="border-b hover:bg-orange-50">
                            <td className="px-4 py-3 font-bold">{inv.month}</td>
                            <td className="px-4 py-3 text-sm">{inv.tenant?.fullName || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-600">{inv.electricity?.usage || 0} số</td>
                            <td className="px-4 py-3 text-gray-600">{inv.water?.usage || 0} khối</td>
                            <td className="px-4 py-3 text-blue-600 font-bold">{inv.totalAmount?.toLocaleString() || 0} đ</td>
                            <td className="px-4 py-3">
                              {inv.status === "PAID" ? (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">✓ Đã Thu</span>
                              ) : (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">⚠ Nợ</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <a 
                                href={`/bill/${inv.accessKey}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                Xem Bill
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
