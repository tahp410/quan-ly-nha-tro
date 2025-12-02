import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const TenantList = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "current" | "left"
  const [roomFilter, setRoomFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [endDateFrom, setEndDateFrom] = useState("");
  const [endDateTo, setEndDateTo] = useState("");

  // Lấy danh sách phòng để filter
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axiosClient.get("/rooms");
        setRooms(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách phòng:", error);
      }
    };
    fetchRooms();
  }, []);

  // Lấy danh sách tenants với filter
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (roomFilter !== "all") params.roomId = roomFilter;
      if (searchQuery) params.search = searchQuery;
      if (startDateFrom) params.startDateFrom = startDateFrom;
      if (startDateTo) params.startDateTo = startDateTo;
      if (endDateFrom) params.endDateFrom = endDateFrom;
      if (endDateTo) params.endDateTo = endDateTo;

      const res = await axiosClient.get("/tenants", { params });
      setTenants(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách khách:", error);
      alert("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, roomFilter, startDateFrom, startDateTo, endDateFrom, endDateTo]);

  // Tìm kiếm với debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants();
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleViewDetail = (roomId) => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setRoomFilter("all");
    setSearchQuery("");
    setStartDateFrom("");
    setStartDateTo("");
    setEndDateFrom("");
    setEndDateTo("");
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">👥 Quản Lý Khách Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tất cả khách hàng ({tenants.length} người)</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
        >
          ← Quay lại
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">🔍 Bộ Lọc & Tìm Kiếm</h2>
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tìm kiếm */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm (Tên, SĐT, Quê quán)
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên, số điện thoại hoặc quê quán..."
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="current">Đang ở</option>
              <option value="left">Đã rời</option>
            </select>
          </div>

          {/* Filter phòng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phòng
            </label>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả phòng</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày vào từ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày vào từ
            </label>
            <input
              type="date"
              value={startDateFrom}
              onChange={(e) => setStartDateFrom(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Ngày vào đến */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày vào đến
            </label>
            <input
              type="date"
              value={startDateTo}
              onChange={(e) => setStartDateTo(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Ngày rời từ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày rời từ
            </label>
            <input
              type="date"
              value={endDateFrom}
              onChange={(e) => setEndDateFrom(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Ngày rời đến */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày rời đến
            </label>
            <input
              type="date"
              value={endDateTo}
              onChange={(e) => setEndDateTo(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">Không tìm thấy khách hàng nào</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-3">Họ Tên</th>
                  <th className="px-4 py-3">Số Điện Thoại</th>
                  <th className="px-4 py-3">Quê Quán</th>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="px-4 py-3">Ngày Vào</th>
                  <th className="px-4 py-3">Ngày Rời</th>
                  <th className="px-4 py-3">Trạng Thái</th>
                  <th className="px-4 py-3">Số Ngày Ở</th>
                  <th className="px-4 py-3">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(tenant => (
                  <tr key={tenant._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800">{tenant.fullName}</td>
                    <td className="px-4 py-3">{tenant.phone || "-"}</td>
                    <td className="px-4 py-3">{tenant.hometown || "-"}</td>
                    <td className="px-4 py-3">
                      {tenant.room ? (
                        <span className="font-semibold text-blue-600">
                          {tenant.room.name}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">{formatDate(tenant.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(tenant.endDate)}</td>
                    <td className="px-4 py-3">
                      {tenant.hasLeft ? (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                          Đã rời
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                          Đang ở
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {tenant.daysStayed || 0} ngày
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {tenant.room ? (
                        <button
                          onClick={() => handleViewDetail(tenant.room._id)}
                          className="text-blue-600 hover:underline font-medium text-sm"
                        >
                          Xem chi tiết
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantList;

