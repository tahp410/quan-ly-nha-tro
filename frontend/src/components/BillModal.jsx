// src/components/BillModal.jsx
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const BillModal = ({ isOpen, onClose, room, onSuccess, invoiceToEdit = null }) => {
  const [newElec, setNewElec] = useState("");
  const [newWater, setNewWater] = useState("");
  const [extraFee, setExtraFee] = useState(0); // --- MỚI: State lưu phụ phí ---
  const [month, setMonth] = useState("12/2025");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room) return;

    if (invoiceToEdit) {
      // Mode sửa hóa đơn: lấy dữ liệu từ hóa đơn cũ
      setMonth(invoiceToEdit.month || "");
      setNewElec(invoiceToEdit.electricity?.new ?? "");
      setNewWater(invoiceToEdit.water?.new ?? "");
      setExtraFee(invoiceToEdit.additionalFees ?? 0);
      setSelectedTenant(invoiceToEdit.tenant?._id || "");
    } else {
      // Mode tạo mới hóa đơn
      setMonth("12/2025");
      setNewElec(room.lastReadings?.electricity || 0);
      setNewWater(room.lastReadings?.water || 0);
      setExtraFee(0); // Reset phụ phí về 0 mỗi khi mở form
      const firstTenant = room.currentTenants?.[0]?._id || "";
      setSelectedTenant(firstTenant);
    }
  }, [room, invoiceToEdit]);

  if (!isOpen || !room) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (invoiceToEdit) {
        // Gọi API sửa hóa đơn
        await axiosClient.put(`/invoices/${invoiceToEdit._id}`, {
          newElec: Number(newElec),
          newWater: Number(newWater),
          additionalFees: Number(extraFee),
        });
        alert("Cập nhật hóa đơn thành công!");
      } else {
        // Gọi API tạo mới hóa đơn
        await axiosClient.post("/invoices/create", {
          roomId: room._id,
          month: month,
          newElec: Number(newElec),
          newWater: Number(newWater),
          additionalFees: Number(extraFee), // --- Gửi phụ phí lên server ---
          tenantId: selectedTenant || undefined,
        });
        alert("Lập hóa đơn thành công!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi tính tiền!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-blue-800 mb-4">
          {invoiceToEdit ? "Sửa hóa đơn phòng " : "Tính tiền phòng "}
          {room.name}
        </h2>

        {/* Nhập tháng */}
        {/* Chọn khách đại diện */}
        {room.currentTenants?.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Khách đại diện</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {room.currentTenants.map((tenant) => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.fullName}
                </option>
              ))}
            </select>
            {room.currentTenants.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                * Dùng để ghi tên người nhận hoá đơn / đường link.
              </p>
            )}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tháng chốt sổ</label>
          <input
            type="text"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {/* Khu vực nhập điện nước */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h3 className="font-bold text-yellow-800 mb-2">⚡ Điện (Số cũ: {room.lastReadings?.electricity})</h3>
            <input
              type="number"
              className="w-full border p-1 rounded font-bold"
              placeholder="Số mới..."
              value={newElec}
              onChange={(e) => setNewElec(e.target.value)}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">💧 Nước (Số cũ: {room.lastReadings?.water})</h3>
            <input
              type="number"
              className="w-full border p-1 rounded font-bold"
              placeholder="Số mới..."
              value={newWater}
              onChange={(e) => setNewWater(e.target.value)}
            />
          </div>
        </div>

        {/* --- MỚI: Khu vực nhập Phụ phí --- */}
        <div className="mb-6 bg-red-50 p-3 rounded border border-red-200">
           <label className="block text-sm font-bold text-red-800 mb-1">
               💸 Phụ phí / Giảm giá (VND)
           </label>
           <input
              type="number"
              className="w-full border p-2 rounded font-bold text-red-700"
              placeholder="0"
              value={extraFee}
              onChange={(e) => setExtraFee(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1 italic">
                * Nhập số dương để cộng thêm (VD: 50000). <br/>
                * Nhập số âm để giảm giá (VD: -20000).
            </p>
        </div>
        {/* -------------------------------- */}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            {loading ? "Đang tính..." : "Xác nhận & Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillModal;