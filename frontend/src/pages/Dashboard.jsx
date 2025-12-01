import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  // Lấy tháng và năm hiện tại
  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return { month, year };
  };

  // Tạo danh sách các tháng (1-12)
  const generateMonthList = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push({
        value: String(i).padStart(2, '0'),
        label: `Tháng ${String(i).padStart(2, '0')}`
      });
    }
    return months;
  };

  // Tạo danh sách các năm (từ năm trước đến 5 năm sau)
  const generateYearList = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const years = [];
    
    for (let i = currentYear - 1; i <= currentYear + 5; i++) {
      years.push({
        value: i.toString(),
        label: `Năm ${i}`
      });
    }
    return years;
  };

  useEffect(() => {
    const { month, year } = getCurrentMonthYear();
    setSelectedMonth(month);
    setSelectedYear(year.toString());
    setAvailableMonths(generateMonthList());
    setAvailableYears(generateYearList());
    fetchStats();
    fetchPaymentSummary(month, year.toString());
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get("/dashboard");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPaymentSummary = async (month, year) => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/invoices/summary/month", {
        params: { month, year }
      });
      setPaymentSummary(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy tóm tắt thanh toán:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    fetchPaymentSummary(newMonth, selectedYear);
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    fetchPaymentSummary(selectedMonth, newYear);
  };

  // Filter dữ liệu phòng theo từ khóa tìm kiếm
  const filteredRooms = paymentSummary.filter(room =>
    room.roomName.toLowerCase().includes(searchRoom.toLowerCase()) ||
    room.tenantName.toLowerCase().includes(searchRoom.toLowerCase())
  );

  if (!stats) return <div className="p-4 text-center">Đang tải báo cáo...</div>;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">📊 Báo Cáo Tổng Quan</h1>

      {/* Thống kê số lượng */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Tổng số phòng</p>
          <p className="text-2xl font-bold">{stats.totalRooms}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Phòng trống</p>
          <p className="text-2xl font-bold">{stats.emptyRooms}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Khách đang ở</p>
          <p className="text-2xl font-bold">{stats.totalTenants}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Đã thuê</p>
          <p className="text-2xl font-bold">{stats.rentedRooms}</p>
        </div>
      </div>

      {/* Tài chính */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Tài Chính Tháng {stats.currentMonth}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500">Doanh thu dự kiến</p>
            <p className="text-3xl font-extrabold text-blue-600">
              {stats.revenueThisMonth.toLocaleString()} đ
            </p>
          </div>
          <div>
            <p className="text-gray-500">Chưa thu được (Nợ)</p>
            <p className="text-3xl font-extrabold text-red-500">
              {stats.unpaidThisMonth.toLocaleString()} đ
            </p>
          </div>
        </div>
      </div>

      {/* FILTER THÁNG/NĂM & TÌM KIẾM PHÒNG */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">📋 Chi Tiết Thanh Toán Theo Phòng</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-medium transition"
          >
            ↩️ Quay Lại Trang Chủ
          </button>
        </div>

        {/* KHỐI FILTER */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filter Tháng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
              <select 
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full border border-gray-300 p-2 rounded text-sm bg-white cursor-pointer hover:border-blue-500"
              >
                {availableMonths.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Năm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
              <select 
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full border border-gray-300 p-2 rounded text-sm bg-white cursor-pointer hover:border-blue-500"
              >
                {availableYears.map(y => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tìm kiếm Phòng/Khách */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm phòng hoặc khách</label>
              <input 
                type="text"
                placeholder="Nhập tên phòng hoặc tên khách..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-sm hover:border-blue-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        {loading && <p className="text-center text-gray-500">Đang tải...</p>}

        {!loading && filteredRooms.length === 0 && paymentSummary.length === 0 && (
          <p className="text-center text-gray-500 py-4">Chưa có dữ liệu tháng {selectedMonth}/{selectedYear}</p>
        )}

        {!loading && filteredRooms.length === 0 && paymentSummary.length > 0 && (
          <p className="text-center text-gray-500 py-4">Không tìm thấy phòng hoặc khách phù hợp</p>
        )}

        {!loading && filteredRooms.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="px-4 py-3">Khách</th>
                  <th className="px-4 py-3">Tiền Cơ Bản</th>
                  <th className="px-4 py-3">Tổng Tiền</th>
                  <th className="px-4 py-3">Đã Trả</th>
                  <th className="px-4 py-3">Nợ</th>
                  <th className="px-4 py-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map(room => (
                  <tr key={room.roomId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-blue-600">{room.roomName}</td>
                    <td className="px-4 py-3">{room.tenantName}</td>
                    <td className="px-4 py-3">{room.basePrice.toLocaleString()} đ</td>
                    <td className="px-4 py-3 font-bold">{room.totalAmount.toLocaleString()} đ</td>
                    <td className="px-4 py-3 text-green-600">{room.paidAmount.toLocaleString()} đ</td>
                    <td className="px-4 py-3 text-red-600">{room.unpaidAmount.toLocaleString()} đ</td>
                    <td className="px-4 py-3">
                      {room.isPaid ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold">✓ Đã Thu</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold">⚠ Nợ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Hiển thị số kết quả */}
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
              Hiển thị <strong>{filteredRooms.length}</strong> kết quả từ <strong>{paymentSummary.length}</strong> phòng
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;