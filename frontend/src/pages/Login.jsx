import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", { username, password });
      
      // 1. Lưu Token vào bộ nhớ trình duyệt
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // 2. Chuyển hướng vào trang chủ
      alert("Đăng nhập thành công!");
      navigate("/"); 
      window.location.reload(); // Reload để cập nhật token cho axios
      
    } catch (error) {
      alert("Đăng nhập thất bại: " + (error.response?.data?.message || "Lỗi Server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
          🔐 Đăng Nhập
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tài khoản</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;