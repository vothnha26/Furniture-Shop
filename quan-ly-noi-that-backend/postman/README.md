# 📬 Postman Collection - Hệ Thống Khuyến Mãi Kép

## 📦 Files trong thư mục

1. **Promotion-System.postman_collection.json** - Collection chính với tất cả API
2. **Promotion-Environment.postman_environment.json** - Environment variables
3. **README.md** - Hướng dẫn sử dụng (file này)

---

## 🚀 Cách Import vào Postman

### Bước 1: Mở Postman

### Bước 2: Import Collection
1. Click **Import** ở góc trên bên trái
2. Kéo thả hoặc chọn file `Promotion-System.postman_collection.json`
3. Click **Import**

### Bước 3: Import Environment
1. Click **Import** tiếp
2. Chọn file `Promotion-Environment.postman_environment.json`
3. Click **Import**

### Bước 4: Chọn Environment
1. Ở góc trên bên phải, click dropdown **No Environment**
2. Chọn **Promotion System - Development**

---

## 📁 Cấu Trúc Collection

```
Hệ Thống Khuyến Mãi Kép
│
├── 1. Chương Trình Giảm Giá Sản Phẩm
│   ├── Admin - CRUD
│   │   ├── 1.1 Tạo chương trình đơn giản
│   │   ├── 1.2 Tạo chương trình kèm biến thể
│   │   ├── 1.3 Lấy tất cả chương trình (cơ bản)
│   │   ├── 1.4 Lấy tất cả chương trình (chi tiết)
│   │   ├── 1.5 Lấy chi tiết 1 chương trình
│   │   ├── 1.6 Thêm biến thể vào chương trình
│   │   ├── 1.7 Xóa biến thể khỏi chương trình
│   │   ├── 1.8 Cập nhật chương trình kèm biến thể
│   │   └── 1.9 Xóa chương trình
│   │
│   └── Khách Hàng - Xem Giá
│       ├── 2.1 Xem giá hiển thị của biến thể
│       └── 2.2 Xem chi tiết giá của biến thể
│
├── 2. Hệ Thống Voucher
│   ├── Admin - CRUD Voucher
│   │   ├── 3.1 Tạo voucher cho mọi người (% giảm)
│   │   ├── 3.2 Tạo voucher cho mọi người (giảm cố định)
│   │   ├── 3.3 Tạo voucher cho hạng VIP
│   │   ├── 3.4 Lấy tất cả voucher (cơ bản)
│   │   ├── 3.5 Lấy tất cả voucher (chi tiết)
│   │   ├── 3.6 Lấy chi tiết 1 voucher
│   │   ├── 3.7 Cập nhật voucher
│   │   └── 3.8 Xóa voucher
│   │
│   └── Khách Hàng - Sử Dụng Voucher
│       ├── 4.1 Xem voucher có thể dùng
│       ├── 4.2 Áp dụng voucher (chi tiết)
│       └── 4.3 Áp dụng voucher (số tiền giảm)
│
└── 3. Kịch Bản Test Tổng Hợp
    └── Kịch Bản 1: Mua hàng có giảm giá + voucher
        ├── Bước 1: Xem giá sản phẩm 1
        ├── Bước 2: Xem giá sản phẩm 2
        ├── Bước 3: Xem voucher có thể dùng
        └── Bước 4: Áp dụng voucher
```

---

## 🎯 Hướng Dẫn Test Theo Thứ Tự

### 📝 Chuẩn Bị
1. Khởi động server: `./mvnw spring-boot:run`
2. Đảm bảo có dữ liệu mẫu (SanPham, BienTheSanPham, KhachHang, HangThanhVien)

---

### 🎨 Test Flow 1: Chương Trình Giảm Giá

#### **Bước 1: Tạo chương trình kèm biến thể**
```
POST /api/v1/chuong-trinh-giam-gia/with-details
```
- Request mẫu có sẵn trong collection
- Lưu lại `maChuongTrinhGiamGia` từ response

#### **Bước 2: Xem danh sách chương trình**
```
GET /api/v1/chuong-trinh-giam-gia/details
```
- Kiểm tra chương trình vừa tạo
- Xem trạng thái: `CHUA_BAT_DAU`, `DANG_DIEN_RA`, `DA_KET_THUC`

#### **Bước 3: Xem giá sản phẩm (Khách hàng)**
```
GET /api/v1/chuong-trinh-giam-gia/bien-the/1/gia-chi-tiet
```
- Xem giá gốc, giá sau giảm
- Xem % giảm, tiết kiệm
- Xem các chương trình đang áp dụng

#### **Bước 4: Thêm biến thể mới vào chương trình**
```
POST /api/v1/chuong-trinh-giam-gia/1/bien-the/5?giaSauGiam=2500000
```

#### **Bước 5: Cập nhật chương trình**
```
PUT /api/v1/chuong-trinh-giam-gia/1/with-details
```
- Thay đổi danh sách biến thể
- Sửa ngày bắt đầu/kết thúc

---

### 🎟️ Test Flow 2: Voucher

#### **Bước 1: Tạo voucher giảm % cho mọi người**
```
POST /api/v1/voucher
Body: TETALE2025 - giảm 15%
```

#### **Bước 2: Tạo voucher giảm cố định cho VIP**
```
POST /api/v1/voucher
Body: VIP2025 - giảm 500.000đ cho hạng 2,3
```

#### **Bước 3: Xem tất cả voucher**
```
GET /api/v1/voucher/details
```
- Kiểm tra trạng thái voucher
- Xem hạng thành viên áp dụng

#### **Bước 4: Khách hàng xem voucher có thể dùng**
```
GET /api/v1/voucher/eligible/1/details
```
- Thay `1` bằng mã khách hàng thực tế
- Voucher hiển thị dựa trên hạng thành viên

#### **Bước 5: Áp dụng voucher**
```
POST /api/v1/voucher/apply/details
Body: {
  "maCode": "TETALE2025",
  "tongTienDonHang": 10000000,
  "maKhachHang": 1
}
```
- Xem số tiền giảm
- Xem tổng tiền sau giảm

---

### 🎭 Test Flow 3: Kịch Bản Tổng Hợp

**Mục tiêu:** Mua 2 sản phẩm có giảm giá + dùng voucher

#### **Bước 1: Xem giá sản phẩm 1**
```
GET /api/v1/chuong-trinh-giam-gia/bien-the/1/gia-chi-tiet
```
**Kết quả giả định:**
- Giá gốc: 5.000.000đ
- Giá sau giảm: 4.500.000đ
- Tiết kiệm: 500.000đ

#### **Bước 2: Xem giá sản phẩm 2**
```
GET /api/v1/chuong-trinh-giam-gia/bien-the/2/gia-chi-tiet
```
**Kết quả giả định:**
- Giá gốc: 3.500.000đ
- Giá sau giảm: 3.200.000đ
- Tiết kiệm: 300.000đ

**➡️ Tổng giỏ hàng: 7.700.000đ**

#### **Bước 3: Xem voucher có thể dùng**
```
GET /api/v1/voucher/eligible/1/details
```
**Kết quả:** Thấy voucher `TETALE2025` giảm 15%

#### **Bước 4: Áp dụng voucher**
```
POST /api/v1/voucher/apply/details
{
  "maCode": "TETALE2025",
  "tongTienDonHang": 7700000,
  "maKhachHang": 1
}
```

**Kết quả:**
```json
{
  "success": true,
  "message": "Áp dụng voucher thành công!",
  "maCode": "TETALE2025",
  "tongTienGoc": 7700000,
  "soTienGiam": 1155000,
  "tongTienSauGiam": 6545000,
  "loaiGiamGia": "PERCENT",
  "giaTriGiam": 15
}
```

**💰 Tổng Tiết Kiệm:**
- Giảm giá sản phẩm: 800.000đ
- Giảm giá voucher: 1.155.000đ
- **Tổng: 1.955.000đ**
- **Thanh toán: 6.545.000đ** (thay vì 8.5tr)

---

## 🔧 Environment Variables

| Variable | Mô tả | Giá trị mặc định |
|----------|-------|------------------|
| `base_url` | URL server | `http://localhost:8080` |
| `chuong_trinh_id` | ID chương trình để test | `1` |
| `bien_the_id` | ID biến thể để test | `1` |
| `voucher_id` | ID voucher để test | `1` |
| `khach_hang_id` | ID khách hàng để test | `1` |

**Cách thay đổi:**
1. Click vào Environment ở góc phải
2. Click Edit
3. Sửa giá trị
4. Save

---

## 📊 Test Cases Quan Trọng

### ✅ Test Case 1: Tạo chương trình thành công
- **Request:** POST với data hợp lệ
- **Expected:** Status 200, trả về object chương trình

### ✅ Test Case 2: Giá hiển thị đúng
- **Request:** GET giá của biến thể có nhiều chương trình
- **Expected:** Lấy giá thấp nhất

### ✅ Test Case 3: Tạo voucher cho VIP
- **Request:** POST với `apDungChoMoiNguoi = false`
- **Expected:** Chỉ hạng được chọn mới thấy voucher

### ✅ Test Case 4: Áp dụng voucher hết hạn
- **Request:** POST với voucher đã hết hạn
- **Expected:** Status 400, message "Voucher đã hết hạn"

### ✅ Test Case 5: Áp dụng voucher không đủ hạng
- **Request:** POST với khách hàng không đủ hạng
- **Expected:** Status 400, message "Không áp dụng cho hạng..."

### ✅ Test Case 6: Voucher giảm không vượt tổng tiền
- **Request:** Voucher giảm 1tr nhưng đơn hàng 500k
- **Expected:** Chỉ giảm 500k

---

## 🐛 Troubleshooting

### ❌ Lỗi: Connection Refused
**Nguyên nhân:** Server chưa chạy
**Giải pháp:** Chạy `./mvnw spring-boot:run`

### ❌ Lỗi: 404 Not Found
**Nguyên nhân:** URL sai hoặc context path khác
**Giải pháp:** Kiểm tra `application.properties`

### ❌ Lỗi: 400 Bad Request - Validation
**Nguyên nhân:** Dữ liệu không hợp lệ
**Giải pháp:** Kiểm tra body request theo mẫu

### ❌ Lỗi: 404 - Resource Not Found
**Nguyên nhân:** ID không tồn tại trong database
**Giải pháp:** 
- Kiểm tra ID trong database
- Hoặc tạo mới trước khi test

### ❌ Lỗi: 400 - Invalid Voucher
**Nguyên nhân:** Voucher hết hạn hoặc không đủ điều kiện
**Giải pháp:** 
- Kiểm tra ngày voucher
- Kiểm tra hạng thành viên khách hàng

---

## 💡 Tips

1. **Chạy theo thứ tự:** Chạy CREATE trước, sau đó GET để xem kết quả
2. **Lưu ID:** Sau khi tạo, copy ID để dùng cho các request khác
3. **Kiểm tra Response:** Đọc kỹ response để hiểu dữ liệu trả về
4. **Test Case âm:** Thử các trường hợp lỗi để test validation
5. **Environment:** Dùng environment variables để dễ thay đổi

---

## 📝 Ghi Chú

- Tất cả endpoint đều có description chi tiết
- Body mẫu đã được cung cấp sẵn
- Có thể sửa body để test các case khác nhau
- Response có thể khác tùy vào dữ liệu trong database

---

## 🎉 Chúc Test Thành Công!

Nếu có vấn đề, tham khảo:
- `PROMOTION_SYSTEM_README.md` - Tài liệu API đầy đủ
- `IMPLEMENTATION_SUMMARY.md` - Tổng quan implementation
