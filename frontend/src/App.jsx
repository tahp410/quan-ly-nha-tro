import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoomList from "./pages/RoomList";
import InvoiceDetail from "./pages/InvoiceDetail";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RoomDetail from "./pages/RoomDetail";
import TenantList from "./pages/TenantList";

// Component bảo vệ: Nếu có token thì cho qua, không thì đá về Login
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang đăng nhập (Ai cũng vào được) */}
        <Route path="/login" element={<Login />} />

        {/* --- CÁC TRANG CẦN ĐĂNG NHẬP (ADMIN) --- */}
        
        {/* Trang chủ: Danh sách phòng */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <RoomList />
            </PrivateRoute>
          } 
        />

        {/* Trang Báo cáo (Dashboard) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Trang Chi tiết phòng (Lịch sử & Sửa) */}
        <Route 
          path="/room/:id" 
          element={
            <PrivateRoute>
              <RoomDetail />
            </PrivateRoute>
          } 
        />

        {/* Trang Quản lý tất cả khách hàng */}
        <Route 
          path="/tenants" 
          element={
            <PrivateRoute>
              <TenantList />
            </PrivateRoute>
          } 
        />

        {/* --- TRANG CÔNG KHAI (KHÁCH XEM) --- */}
        <Route path="/bill/:key" element={<InvoiceDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;