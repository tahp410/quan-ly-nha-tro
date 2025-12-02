import axios from 'axios';

// Ưu tiên dùng biến môi trường VITE_API_URL, fallback về localhost khi dev
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- THÊM ĐOẠN NÀY (Interceptor) ---
// Trước khi gửi request đi, tự động móc Token từ túi ra dán vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý khi Token hết hạn (401) -> Đá về trang login
// Lưu ý: Không redirect nếu đang ở trang bill công khai
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Không redirect nếu đang xem bill công khai (route /bill/:key)
      if (!window.location.pathname.startsWith('/bill/')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
// ------------------------------------

export default axiosClient;