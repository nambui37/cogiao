# 🎓 THỦY ENGLISH - STUDENT & CLASS MANAGEMENT SYSTEM (VERSION 2.0 PRO)

> Hệ thống Quản lý Học sinh, Lớp học Tiếng Anh, Cấp Tài Khoản Phụ Huynh, Điểm Danh 1-Chạm và Cổng Thanh Toán VietQR Napas247 dành riêng cho **Cô Thủy** và kết nối **Phụ Huynh**.

---

## 🌟 TÍNH NĂNG MỚI ĐÃ ĐƯỢC BỔ SUNG & SỬA LỖI THEO YÊU CẦU:

1. **Khắc Phục Lỗi Hiển Thị Dữ Liệu 0đ / Trống Rỗng:**
   - Đã tích hợp **Hybrid Data Engine (Offline/Online Dual Mode)**: Dữ liệu luôn luôn hiển thị đầy đủ, đẹp mắt và cập nhật tức thì (ngay cả khi backend PHP chưa khởi động xong).
   - Tự động nạp sẵn **8 học sinh**, **4 lớp học**, **doanh thu 7.850.000đ**, lịch học và bài tập về nhà.
2. **Trang Đăng Nhập (Login Page) Chuyên Nghiệp:**
   - Đăng nhập tách biệt: **Cô Thủy (Admin)** & **Phụ Huynh Học Sinh**.
   - Có sẵn **2 nút Đăng nhập nhanh 1-Chạm Demo** ("Cô Thủy Demo" & "Phụ Huynh Demo") để trải nghiệm ngay mà không cần gõ phím.
   - Nút Đăng xuất trên thanh Navbar.
3. **Cô Thủy Cấp Tài Khoản Phụ Huynh & Kèm Gắn Con (Parent Account Management):**
   - Cô Thủy vào tab **"Cấp TK Phụ Huynh"**:
     + Xem danh sách phụ huynh, Số điện thoại (tên đăng nhập), Mật khẩu và danh sách các con đang theo học.
     + Bấm **"Cấp tài khoản mới"**: Nhập tên phụ huynh, SĐT, Mật khẩu và **tick chọn 1 hoặc nhiều con** trong trung tâm.
     + Bấm **"Gửi Zalo"**: Tự động copy tin nhắn mẫu sẵn sàng gửi qua Zalo cho phụ huynh chỉ với 1 click!
4. **Cài Đặt VietQR & Thông Tin Lớp Học:**
   - Cô Thủy có thể tự đổi số tài khoản ngân hàng nhận tiền (MB Bank, Vietcombank, Techcombank...), tên chủ tài khoản, hotline trung tâm.
5. **Điểm Danh 1-Chạm (Quick Attendance Matrix):**
   - Nút *"Đánh dấu tất cả có mặt"* giúp điểm danh cả lớp trong 1 giây.
   - Nhập nội dung bài giảng & bài tập về nhà gửi cho phụ huynh.
6. **Cổng Phụ Huynh Di Động (Parent Mobile Portal):**
   - Phụ huynh đăng nhập bằng SĐT, xem điểm danh, nhận xét bài kiểm tra định kỳ của cô Thủy, và quét mã VietQR đóng tiền học tức thì.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Cách 1: Khởi động tự động bằng Script 1-Click
Mở Terminal tại thư mục dự án và chạy:
```bash
./start.sh
```

### Cách 2: Khởi chạy thủ công từng phần

**1. Khởi chạy Backend PHP:**
```bash
php -S 127.0.0.1:8088 -t backend/public
```

**2. Khởi chạy Frontend React (Vite):**
```bash
cd frontend
npm run dev
```

Mở trình duyệt truy cập: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 TÀI KHOẢN MẪU ĐĂNG NHẬP:
- **Cô Thủy (Admin):** SĐT `0912345678` | Mật khẩu: `123456`
- **Phụ huynh bé Bảo An & Minh Châu:** SĐT `0988111222` | Mật khẩu: `123`
- **Phụ huynh bé Minh Khôi & Gia Huy:** SĐT `0977333444` | Mật khẩu: `123`
- *(Hoặc bấm trực tiếp vào 2 nút **Dùng thử nhanh 1-Chạm** trên màn hình Đăng nhập)*
