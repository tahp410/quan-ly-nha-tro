import { useState } from "react";
import axiosClient from "../api/axiosClient";

const TenantModal = ({ isOpen, onClose, room, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    cccd: "",
    hometown: "",
    deposit: 0,
    startDate: new Date().toISOString().split('T')[0] // Mặc định hôm nay
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !room) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axiosClient.post("/tenants", {
        ...formData,
        roomId: room._id, // Gắn khách vào phòng này
        deposit: Number(formData.deposit)
      });
      
      alert("Thêm khách thành công!");
      onSuccess(); // Load lại danh sách phòng
      onClose();   // Đóng modal
    } catch (error) {
      alert("Lỗi thêm khách: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-green-700 mb-4">
          Thêm khách vào phòng {room.name}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và Tên</label>
            <input
              name="fullName"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ví dụ: Nguyễn Văn A"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                name="phone"
                className="w-full border p-2 rounded"
                placeholder="098..."
                onChange={handleChange}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">CCCD</label>
              <input
                name="cccd"
                className="w-full border p-2 rounded"
                placeholder="12 số..."
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quê quán</label>
            <input
              name="hometown"
              className="w-full border p-2 rounded"
              placeholder="Ví dụ: Đà Nẵng, Nghệ An..."
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tiền cọc (đ)</label>
              <input
                type="number"
                name="deposit"
                className="w-full border p-2 rounded font-bold"
                placeholder="3000000"
                onChange={handleChange}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Ngày vào ở</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                className="w-full border p-2 rounded"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            {loading ? "Đang lưu..." : "Lưu Khách"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantModal;