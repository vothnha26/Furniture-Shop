# HỆ THỐNG KHUYẾN MÃI KÉP - Quản Lý Nội Thất

## Tổng quan
Hệ thống khuyến mãi kép bao gồm 2 loại giảm giá:
1. **Giảm giá trực tiếp trên biến thể sản phẩm** - Chương trình giảm giá áp dụng cho từng biến thể
2. **Voucher giảm giá cho toàn bộ đơn hàng** - Mã giảm giá áp dụng khi thanh toán

---

## 1. Chương Trình Giảm Giá Trực Tiếp

### 📌 Mô tả
- Tạo chương trình giảm giá theo thời gian
- Áp dụng giá đặc biệt cho từng biến thể sản phẩm
- Hiển thị giá ưu đãi trực tiếp trên sản phẩm
- Cho phép nhiều chương trình giảm giá áp dụng đồng thời (lấy giá thấp nhất)

### 🔧 API Endpoints

#### **Admin/Nhân viên**

##### 1. Tạo chương trình đơn giản
```http
POST /api/v1/chuong-trinh-giam-gia
Content-Type: application/json

{
  "ten": "Flash Sale Cuối Tuần",
  "ngayBatDau": "2025-10-15T00:00:00",
  "ngayKetThuc": "2025-10-17T23:59:59"
}
```

##### 2. Tạo chương trình kèm danh sách biến thể
```http
POST /api/v1/chuong-trinh-giam-gia/with-details
Content-Type: application/json

{
  "tenChuongTrinh": "Khuyến mãi Tết 2025",
  "ngayBatDau": "2025-01-15T00:00:00",
  "ngayKetThuc": "2025-02-15T23:59:59",
  "danhSachBienThe": [
    {
      "maBienThe": 1,
      "giaSauGiam": 4500000
    },
    {
      "maBienThe": 2,
      "giaSauGiam": 3200000
    }
  ]
}
```

##### 3. Lấy danh sách chương trình (chi tiết)
```http
GET /api/v1/chuong-trinh-giam-gia/details
```

**Response:**
```json
[
  {
    "maChuongTrinhGiamGia": 1,
    "tenChuongTrinh": "Khuyến mãi Tết 2025",
    "ngayBatDau": "2025-01-15T00:00:00",
    "ngayKetThuc": "2025-02-15T23:59:59",
    "trangThai": "DANG_DIEN_RA",
    "soLuongBienThe": 2,
    "danhSachBienThe": [
      {
        "maBienThe": 1,
        "sku": "GHE-001-RED",
        "tenSanPham": "Ghế Sofa Cao Cấp",
        "giaBanGoc": 5000000,
        "giaSauGiam": 4500000,
        "phanTramGiam": 10.0,
        "soLuongTon": 15
      }
    ]
  }
]
```

##### 4. Thêm/Cập nhật biến thể vào chương trình
```http
POST /api/v1/chuong-trinh-giam-gia/1/bien-the/5?giaSauGiam=2800000
```

##### 5. Xóa biến thể khỏi chương trình
```http
DELETE /api/v1/chuong-trinh-giam-gia/1/bien-the/5
```

##### 6. Cập nhật chương trình
```http
PUT /api/v1/chuong-trinh-giam-gia/1/with-details
Content-Type: application/json

{
  "tenChuongTrinh": "Khuyến mãi Tết 2025 - Mở rộng",
  "ngayBatDau": "2025-01-15T00:00:00",
  "ngayKetThuc": "2025-02-28T23:59:59",
  "danhSachBienThe": [...]
}
```

##### 7. Xóa chương trình
```http
DELETE /api/v1/chuong-trinh-giam-gia/1
```

#### **Khách hàng**

##### 8. Xem giá hiển thị của biến thể
```http
GET /api/v1/chuong-trinh-giam-gia/bien-the/1/gia-hien-thi
```

**Response:** `4500000`

##### 9. Xem chi tiết giá của biến thể
```http
GET /api/v1/chuong-trinh-giam-gia/bien-the/1/gia-chi-tiet
```

**Response:**
```json
{
  "maBienThe": 1,
  "sku": "GHE-001-RED",
  "tenSanPham": "Ghế Sofa Cao Cấp",
  "giaBanGoc": 5000000,
  "giaHienThi": 4500000,
  "coGiamGia": true,
  "phanTramGiam": 10.0,
  "soTienTietKiem": 500000,
  "cacChuongTrinhDangApDung": [
    {
      "maChuongTrinh": 1,
      "tenChuongTrinh": "Khuyến mãi Tết 2025",
      "giaSauGiam": 4500000
    }
  ]
}
```

---

## 2. Hệ Thống Voucher Giảm Giá

### 📌 Mô tả
- Tạo mã voucher giảm giá cho toàn bộ đơn hàng
- Hỗ trợ 2 loại: giảm theo phần trăm (PERCENT) hoặc giảm cố định (FIXED)
- Kiểm soát áp dụng theo hạng thành viên
- Kiểm tra điều kiện và tính toán giảm giá tự động

### 🔧 API Endpoints

#### **Admin/Nhân viên**

##### 1. Tạo voucher áp dụng cho mọi người
```http
POST /api/v1/voucher
Content-Type: application/json

{
  "maCode": "TETALE2025",
  "loaiGiamGia": "PERCENT",
  "giaTriGiam": 15,
  "ngayBatDau": "2025-01-15T00:00:00",
  "ngayKetThuc": "2025-02-15T23:59:59",
  "apDungChoMoiNguoi": true
}
```

##### 2. Tạo voucher cho hạng thành viên cụ thể
```http
POST /api/v1/voucher
Content-Type: application/json

{
  "maCode": "VIP2025",
  "loaiGiamGia": "FIXED",
  "giaTriGiam": 500000,
  "ngayBatDau": "2025-01-01T00:00:00",
  "ngayKetThuc": "2025-12-31T23:59:59",
  "apDungChoMoiNguoi": false,
  "maHangThanhVienIds": [2, 3]
}
```

**Giải thích:**
- `loaiGiamGia`: 
  - `PERCENT`: Giảm theo phần trăm (giaTriGiam = 15 nghĩa là giảm 15%)
  - `FIXED`: Giảm số tiền cố định (giaTriGiam = 500000 nghĩa là giảm 500.000đ)
- `apDungChoMoiNguoi`: 
  - `true`: Tất cả khách hàng đều có thể dùng
  - `false`: Chỉ hạng thành viên trong danh sách mới dùng được

##### 3. Lấy danh sách voucher (chi tiết)
```http
GET /api/v1/voucher/details
```

**Response:**
```json
[
  {
    "maVoucher": 1,
    "maCode": "TETALE2025",
    "loaiGiamGia": "PERCENT",
    "giaTriGiam": 15,
    "ngayBatDau": "2025-01-15T00:00:00",
    "ngayKetThuc": "2025-02-15T23:59:59",
    "trangThai": "DANG_HOAT_DONG",
    "apDungChoMoiNguoi": true,
    "tenHangThanhVienApDung": []
  },
  {
    "maVoucher": 2,
    "maCode": "VIP2025",
    "loaiGiamGia": "FIXED",
    "giaTriGiam": 500000,
    "ngayBatDau": "2025-01-01T00:00:00",
    "ngayKetThuc": "2025-12-31T23:59:59",
    "trangThai": "DANG_HOAT_DONG",
    "apDungChoMoiNguoi": false,
    "tenHangThanhVienApDung": ["Vàng", "Kim Cương"]
  }
]
```

##### 4. Cập nhật voucher
```http
PUT /api/v1/voucher/1
Content-Type: application/json

{
  "maCode": "TETALE2025",
  "loaiGiamGia": "PERCENT",
  "giaTriGiam": 20,
  "ngayBatDau": "2025-01-15T00:00:00",
  "ngayKetThuc": "2025-02-28T23:59:59",
  "apDungChoMoiNguoi": true
}
```

##### 5. Xóa voucher
```http
DELETE /api/v1/voucher/1
```

#### **Khách hàng**

##### 6. Lấy danh sách voucher có thể sử dụng
```http
GET /api/v1/voucher/eligible/1/details
```
*Trong đó `1` là mã khách hàng*

**Response:**
```json
[
  {
    "maVoucher": 1,
    "maCode": "TETALE2025",
    "loaiGiamGia": "PERCENT",
    "giaTriGiam": 15,
    "ngayBatDau": "2025-01-15T00:00:00",
    "ngayKetThuc": "2025-02-15T23:59:59",
    "trangThai": "DANG_HOAT_DONG",
    "apDungChoMoiNguoi": true,
    "tenHangThanhVienApDung": []
  }
]
```

##### 7. Áp dụng voucher khi checkout (chi tiết)
```http
POST /api/v1/voucher/apply/details
Content-Type: application/json

{
  "maCode": "TETALE2025",
  "tongTienDonHang": 10000000,
  "maKhachHang": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Áp dụng voucher thành công!",
  "maCode": "TETALE2025",
  "tongTienGoc": 10000000,
  "soTienGiam": 1500000,
  "tongTienSauGiam": 8500000,
  "loaiGiamGia": "PERCENT",
  "giaTriGiam": 15
}
```

##### 8. Áp dụng voucher (chỉ trả về số tiền giảm)
```http
POST /api/v1/voucher/apply
Content-Type: application/json

{
  "maCode": "TETALE2025",
  "tongTienDonHang": 10000000,
  "maKhachHang": 1
}
```

**Response:** `1500000`

---

## 3. Kịch Bản Sử Dụng Tổng Hợp

### 🎯 Kịch bản 1: Khách hàng mua sản phẩm có giảm giá + dùng voucher

**Bước 1:** Khách hàng xem sản phẩm
```http
GET /api/v1/chuong-trinh-giam-gia/bien-the/1/gia-chi-tiet
```
→ Biết được: Giá gốc 5.000.000đ, giá sau giảm 4.500.000đ

**Bước 2:** Thêm vào giỏ hàng nhiều sản phẩm
- Sản phẩm 1: 4.500.000đ (đã giảm)
- Sản phẩm 2: 3.200.000đ (đã giảm)
- **Tổng tiền:** 7.700.000đ

**Bước 3:** Xem voucher có thể dùng
```http
GET /api/v1/voucher/eligible/1/details
```
→ Thấy có voucher `TETALE2025` giảm 15%

**Bước 4:** Áp dụng voucher khi thanh toán
```http
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
  "tongTienGoc": 7700000,
  "soTienGiam": 1155000,
  "tongTienSauGiam": 6545000
}
```

**💰 Tổng tiết kiệm:**
- Giảm giá sản phẩm: 2.300.000đ (từ 10tr → 7.7tr)
- Giảm giá voucher: 1.155.000đ (15% của 7.7tr)
- **Tổng cộng tiết kiệm: 3.455.000đ**
- **Thanh toán cuối cùng: 6.545.000đ**

---

## 4. Validation và Xử Lý Lỗi

### ✅ Các trường hợp kiểm tra tự động

#### Chương trình giảm giá:
- Ngày kết thúc phải sau ngày bắt đầu
- Giá sau giảm phải là số dương
- Biến thể sản phẩm phải tồn tại

#### Voucher:
- Mã code không được trùng
- Giá trị giảm phải là số dương
- Kiểm tra hạn sử dụng
- Kiểm tra hạng thành viên (nếu có giới hạn)
- Số tiền giảm không vượt quá tổng tiền đơn hàng

### 🚫 Ví dụ lỗi

**1. Voucher hết hạn:**
```json
{
  "success": false,
  "message": "Voucher đã hết hạn hoặc chưa kích hoạt.",
  "maCode": "TETALE2024",
  "tongTienGoc": 10000000,
  "soTienGiam": 0,
  "tongTienSauGiam": 10000000
}
```

**2. Không đủ hạng thành viên:**
```json
{
  "timestamp": "2025-10-12T10:30:00",
  "status": 400,
  "error": "Invalid Voucher",
  "message": "Voucher này không áp dụng cho hạng thành viên của bạn."
}
```

**3. Biến thể không tồn tại:**
```json
{
  "timestamp": "2025-10-12T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Biến thể ID: 999 không tồn tại."
}
```

---

## 5. Lưu Ý Khi Sử Dụng

### ⚠️ Quan trọng

1. **Độ ưu tiên giảm giá:**
   - Giảm giá sản phẩm được áp dụng TRƯỚC
   - Voucher được áp dụng SAU trên tổng tiền đã giảm

2. **Nhiều chương trình giảm giá:**
   - Nếu 1 biến thể có nhiều chương trình đang hoạt động
   - Hệ thống tự động lấy giá THẤP NHẤT

3. **Trạng thái chương trình/voucher:**
   - `CHUA_BAT_DAU`: Chưa đến thời gian
   - `DANG_DIEN_RA` / `DANG_HOAT_DONG`: Đang áp dụng
   - `DA_KET_THUC` / `DA_HET_HAN`: Đã hết hạn

4. **Validation:**
   - Tất cả các trường bắt buộc đều có validation
   - Hệ thống trả về lỗi chi tiết khi dữ liệu không hợp lệ

---

## 6. Testing với Postman

### 📦 Import Collection

Tạo Postman Collection với các request mẫu:

1. **Environment Variables:**
```json
{
  "base_url": "http://localhost:8080",
  "khach_hang_id": "1",
  "chuong_trinh_id": "1",
  "bien_the_id": "1",
  "voucher_id": "1"
}
```

2. **Test Scenarios:**
- Tạo chương trình giảm giá mới
- Thêm biến thể vào chương trình
- Khách hàng xem giá
- Tạo voucher
- Khách hàng kiểm tra voucher
- Áp dụng voucher

---

## 7. Database Schema

### Các bảng liên quan:

```sql
-- Chương trình giảm giá
ChuongTrinhGiamGia (
  MaChuongTrinhGiamGia INT PRIMARY KEY,
  TenChuongTrinh NVARCHAR,
  NgayBatDau DATETIME,
  NgayKetThuc DATETIME
)

-- Biến thể được giảm giá
BienTheGiamGia (
  MaChuongTrinhGiamGia INT,
  MaBienThe INT,
  GiaSauGiam DECIMAL,
  PRIMARY KEY (MaChuongTrinhGiamGia, MaBienThe)
)

-- Voucher
Voucher (
  MaVoucher INT PRIMARY KEY,
  MaCode VARCHAR UNIQUE,
  LoaiGiamGia VARCHAR,
  GiaTriGiam DECIMAL,
  NgayBatDau DATETIME,
  NgayKetThuc DATETIME,
  ApDungChoMoiNguoi BIT
)

-- Giới hạn hạng thành viên của voucher
Voucher_HangThanhVien (
  MaVoucher INT,
  MaHangThanhVien INT,
  PRIMARY KEY (MaVoucher, MaHangThanhVien)
)
```

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu có thắc mắc hoặc gặp lỗi, vui lòng liên hệ team phát triển.

**Chúc bạn sử dụng hệ thống hiệu quả! 🎉**
