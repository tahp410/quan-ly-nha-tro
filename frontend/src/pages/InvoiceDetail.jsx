// src/pages/InvoiceDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const InvoiceDetail = () => {
  const { key } = useParams(); // Lấy key từ URL
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  // Thông tin tài khoản ngân hàng của bạn
  const BANK_ID = "TECHCOMBANK"; 
  const ACCOUNT_NO = "19036832726015"; 
  const ACCOUNT_NAME = "Do Dang Phat"; 

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axiosClient.get(`/invoices/${key}`);
        setBill(res.data);
      } catch (error) {
        // console.error(error); // Tắt log lỗi cho đỡ rối
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [key]);

  if (loading) return <div className="text-center p-10">Đang tải hóa đơn...</div>;
  if (!bill) return <div className="text-center p-10 text-red-500">Hóa đơn không tồn tại</div>;

  // --- AN TOÀN: Tính toán giá trị trước khi render ---
  const roomPrice = bill.roomPriceSnapshot || 0;
  const elecTotal = bill.electricity?.total || 0;
  const waterTotal = bill.water?.total || 0;
  const totalAmount = bill.totalAmount || 0;
  const additionalFees = bill.additionalFees || 0; // Lấy phụ phí
  
  // Link QR VietQR
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.png?amount=${totalAmount}&addInfo=${bill.room?.name} T${bill.month?.replace('/','')}&accountName=${ACCOUNT_NAME}`;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 flex justify-center">
      <div className="bg-white max-w-md w-full rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white text-center">
          <h1 className="text-xl font-bold">HÓA ĐƠN TIỀN NHÀ</h1>
          <p className="opacity-90">Tháng {bill.month} - Phòng {bill.room?.name}</p>
        </div>

        <div className="p-6">
          {/* Thông tin khách */}
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm">Khách thuê</p>
            <p className="font-bold text-gray-800 text-lg">{bill.tenant?.fullName || "Khách vãng lai"}</p>
          </div>

          {/* Bảng chi tiết tiền */}
          <div className="space-y-3 text-sm">
            {/* Tiền Phòng */}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tiền phòng</span>
              <span className="font-semibold">{roomPrice.toLocaleString()} đ</span>
            </div>

            {/* Tiền Điện */}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div className="text-gray-600">
                <div>Điện ({bill.electricity?.usage || 0} số)</div>
                <div className="text-xs text-gray-400">
                  {bill.electricity?.old || 0} ➝ {bill.electricity?.new || 0}
                </div>
              </div>
              <span className="font-semibold">{elecTotal.toLocaleString()} đ</span>
            </div>

            {/* Tiền Nước */}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div className="text-gray-600">
                <div>Nước ({bill.water?.usage || 0} khối)</div>
                <div className="text-xs text-gray-400">
                  {bill.water?.old || 0} ➝ {bill.water?.new || 0}
                </div>
              </div>
              <span className="font-semibold">{waterTotal.toLocaleString()} đ</span>
            </div>

            {/* Dịch vụ khác */}
            {bill.services?.map((s, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{s.name}</span>
                <span className="font-semibold">{(s.price || 0).toLocaleString()} đ</span>
              </div>
            ))}

            {/* --- MỚI: Hiển thị Phụ phí / Giảm giá (Nếu có) --- */}
            {additionalFees !== 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 bg-red-50 px-2 -mx-2 rounded">
                    <span className="text-red-600 font-medium">
                        {additionalFees > 0 ? "Phụ phí / Phát sinh" : "Giảm giá / Khuyến mãi"}
                    </span>
                    <span className="font-bold text-red-600">
                        {additionalFees > 0 ? "+" : ""}
                        {additionalFees.toLocaleString()} đ
                    </span>
                </div>
            )}
            {/* ------------------------------------------------ */}
          </div>

          {/* Tổng cộng */}
          <div className="mt-6 flex justify-between items-center bg-blue-50 p-3 rounded-lg">
            <span className="text-blue-800 font-bold">TỔNG CỘNG</span>
            <span className="text-xl font-extrabold text-blue-600">
              {totalAmount.toLocaleString()} đ
            </span>
          </div>

          {/* Khu vực Mã QR */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Quét mã để thanh toán</p>
            <img src={qrUrl} alt="QR Code" className="mx-auto border rounded-lg w-48" />
            <p className="text-xs text-gray-400 mt-2">Ngân hàng {BANK_ID} - {ACCOUNT_NO}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-center border-t">
            <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-blue-600 font-semibold text-sm hover:underline"
            >
                Copy Link Hóa Đơn
            </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;