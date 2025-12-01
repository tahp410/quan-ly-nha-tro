import { useState } from "react";
import axiosClient from "../api/axiosClient";

const CreateRoomModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    basePrice: "", // Để trống ban đầu
    floor: 1
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // Validate đơn giản
      if (!formData.name || !formData.basePrice) {
        alert("Vui lòng nhập tên phòng và giá!");
        return;
      }

      setLoading(true);
      await axiosClient.post("/rooms", {
        name: formData.name,
        basePrice: Number(formData.basePrice),
        floor: Number(formData.floor)
      });
      
      alert("Tạo phòng thành công!");
      setFormData({ name: "", basePrice: "", floor: 1 }); // Reset form
      onSuccess(); // Load lại danh sách
      onClose();   // Đóng modal
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Tên phòng có thể đã tồn tại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">
          🏠 Thêm Phòng Mới
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên Phòng</label>
            <input
              name="name"
              value={formData.name}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              placeholder="Ví dụ: P103"
              onChange={handleChange}
            />
            <p className="text-xs text-gray-400 mt-1">Tên phòng không được trùng nhau</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Giá thuê cơ bản (đ)</label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              className="w-full border p-2 rounded font-bold"
              placeholder="3000000"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tầng</label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              className="w-full border p-2 rounded"
              onChange={handleChange}
            />
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            {loading ? "Đang tạo..." : "Xác Nhận"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;