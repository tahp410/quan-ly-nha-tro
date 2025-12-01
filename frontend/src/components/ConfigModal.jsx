// src/components/ConfigModal.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const ConfigModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    electricityPrice: 0,
    waterPrice: 0,
    serviceFees: [] 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        try {
          const res = await axiosClient.get("/config");
          if (res.data) {
             setFormData({
                electricityPrice: res.data.electricityPrice,
                waterPrice: res.data.waterPrice,
                // Nếu chưa có dịch vụ nào thì tạo mặc định Wifi, Rác
                serviceFees: res.data.serviceFees.length > 0 
                    ? res.data.serviceFees 
                    : [{ name: "Wifi", price: 100000 }, { name: "Rác", price: 30000 }]
             });
          }
        } catch (error) {
          console.log("Chưa có cấu hình, dùng mặc định");
        }
      };
      fetchConfig();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  // --- MỚI: Hàm xử lý thay đổi Tên hoặc Giá dịch vụ ---
  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.serviceFees];
    // Nếu sửa giá thì ép kiểu số, sửa tên thì giữ nguyên string
    newServices[index][field] = field === 'price' ? Number(value) : value;
    setFormData({ ...formData, serviceFees: newServices });
  };

  // --- MỚI: Hàm thêm dịch vụ mới ---
  const handleAddService = () => {
    setFormData({
      ...formData,
      serviceFees: [...formData.serviceFees, { name: "", price: 0 }]
    });
  };

  // --- MỚI: Hàm xóa dịch vụ ---
  const handleDeleteService = (index) => {
    const newServices = formData.serviceFees.filter((_, i) => i !== index);
    setFormData({ ...formData, serviceFees: newServices });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Lọc bỏ các dịch vụ không có tên để tránh lỗi
      const cleanData = {
        ...formData,
        serviceFees: formData.serviceFees.filter(s => s.name.trim() !== "")
      };

      await axiosClient.post("/config", cleanData);
      alert("Lưu bảng giá thành công!");
      onClose();
    } catch (error) {
      alert("Lỗi lưu cấu hình!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⚙️ Cài Đặt Bảng Giá
        </h2>

        <div className="space-y-4">
          {/* Giá Điện */}
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <label className="block text-sm font-bold text-yellow-800">⚡ Giá Điện (đ/số)</label>
            <input
              type="number"
              name="electricityPrice"
              value={formData.electricityPrice}
              onChange={handleChange}
              className="w-full mt-1 border p-2 rounded bg-white font-semibold outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          {/* Giá Nước */}
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <label className="block text-sm font-bold text-blue-800">💧 Giá Nước (đ/khối)</label>
            <input
              type="number"
              name="waterPrice"
              value={formData.waterPrice}
              onChange={handleChange}
              className="w-full mt-1 border p-2 rounded bg-white font-semibold outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <hr className="border-dashed" />

          {/* Khu vực Dịch vụ động */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Dịch vụ khác (đ/tháng)</label>
                <button 
                    onClick={handleAddService}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 font-bold"
                >
                    + Thêm
                </button>
            </div>

            <div className="space-y-2">
                {formData.serviceFees.map((service, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        {/* Ô nhập Tên dịch vụ */}
                        <input
                            type="text"
                            placeholder="Tên DV (VD: Rác)"
                            value={service.name}
                            onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                            className="flex-1 border p-2 rounded text-sm outline-none focus:border-blue-500"
                        />
                        
                        {/* Ô nhập Giá */}
                        <input
                            type="number"
                            placeholder="Giá"
                            value={service.price}
                            onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                            className="w-24 border p-2 rounded text-sm text-right outline-none focus:border-blue-500"
                        />

                        {/* Nút Xóa */}
                        <button 
                            onClick={() => handleDeleteService(index)}
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Xóa dịch vụ này"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            
            {formData.serviceFees.length === 0 && (
                <p className="text-center text-xs text-gray-400 mt-2">Chưa có dịch vụ nào</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 font-medium"
          >
            {loading ? "Đang lưu..." : "Lưu Cài Đặt"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;