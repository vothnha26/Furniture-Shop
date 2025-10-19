# 🔔 CHỨC NĂNG THÔNG BÁO (NOTIFICATIONS)

## 📋 Tổng quan

Hệ thống thông báo cho Admin/Nhân viên đã được triển khai đầy đủ với các tính năng:

- ✅ Backend API hoàn chỉnh (Spring Boot + SQL Server)
- ✅ Frontend đã có sẵn (React)
- ✅ Tự động tạo thông báo cho các sự kiện quan trọng
- ✅ Đánh dấu đã đọc/chưa đọc
- ✅ Phân loại theo độ ưu tiên
- ✅ Soft delete & maintenance

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Bước 1: Tạo bảng trong Database

Chạy file SQL:

```bash
d:\Furniture-Shop\quan-ly-noi-that-backend\create_thongbao_table.sql
```

Hoặc execute trong SQL Server Management Studio:

```sql
-- Mở file và execute toàn bộ script
```

### Bước 2: Build & Run Backend

```bash
cd d:\Furniture-Shop\quan-ly-noi-that-backend

# Clean build
mvnw clean package

# Run application
mvnw spring-boot:run
```

### Bước 3: Test API

Backend sẽ chạy tại: `http://localhost:8080`

---

## 🔌 API ENDPOINTS

### 📥 GET Endpoints

| Endpoint                               | Mô tả                             | Response                 |
| -------------------------------------- | --------------------------------- | ------------------------ |
| `GET /api/v1/thong-bao`                | Lấy tất cả thông báo              | `List<ThongBao>`         |
| `GET /api/v1/thong-bao/details`        | Lấy tất cả (format snake_case)    | `List<ThongBaoResponse>` |
| `GET /api/v1/thong-bao/{id}`           | Lấy thông báo theo ID             | `ThongBao`               |
| `GET /api/v1/thong-bao/me`             | Lấy thông báo của user đang login | `List<ThongBao>`         |
| `GET /api/v1/thong-bao/chua-doc`       | Lấy thông báo chưa đọc            | `List<ThongBao>`         |
| `GET /api/v1/thong-bao/chua-doc/count` | Đếm số thông báo chưa đọc         | `{"count": 5}`           |
| `GET /api/v1/thong-bao/loai/{loai}`    | Lấy theo loại                     | `List<ThongBao>`         |
| `GET /api/v1/thong-bao/uu-tien-cao`    | Lấy thông báo ưu tiên cao         | `List<ThongBao>`         |

### 📤 POST Endpoints

| Endpoint                           | Mô tả               | Request Body              |
| ---------------------------------- | ------------------- | ------------------------- |
| `POST /api/v1/thong-bao`           | Tạo thông báo mới   | `ThongBaoRequest`         |
| `POST /api/v1/thong-bao/tong-quat` | Tạo thông báo nhanh | `{loai, tieuDe, noiDung}` |

### 🔄 PUT Endpoints

| Endpoint                                       | Mô tả                  |
| ---------------------------------------------- | ---------------------- |
| `PUT /api/v1/thong-bao/{id}`                   | Cập nhật thông báo     |
| `PUT /api/v1/thong-bao/{id}/danh-dau-da-doc`   | Đánh dấu đã đọc        |
| `PUT /api/v1/thong-bao/danh-dau-tat-ca-da-doc` | Đánh dấu tất cả đã đọc |

### ❌ DELETE Endpoints

| Endpoint                                  | Mô tả                       |
| ----------------------------------------- | --------------------------- |
| `DELETE /api/v1/thong-bao/{id}`           | Xóa thông báo (soft delete) |
| `DELETE /api/v1/thong-bao/{id}/vinh-vien` | Xóa vĩnh viễn               |

---

## 📝 TEST VỚI POSTMAN

### 1. Lấy tất cả thông báo

```http
GET http://localhost:8080/api/v1/thong-bao
```

### 2. Tạo thông báo mới

```http
POST http://localhost:8080/api/v1/thong-bao
Content-Type: application/json

{
  "loai": "success",
  "tieuDe": "Test Notification",
  "noiDung": "Đây là thông báo test từ Postman",
  "loaiNguoiNhan": "ALL",
  "doUuTien": "high"
}
```

### 3. Đánh dấu đã đọc

```http
PUT http://localhost:8080/api/v1/thong-bao/1/danh-dau-da-doc
```

### 4. Đếm thông báo chưa đọc

```http
GET http://localhost:8080/api/v1/thong-bao/chua-doc/count
```

### 5. Test tạo thông báo đơn hàng

```http
POST http://localhost:8080/api/v1/thong-bao/test/don-hang-moi
Content-Type: application/json

{
  "maDonHang": 1
}
```

### 6. Test cảnh báo tồn kho

```http
POST http://localhost:8080/api/v1/thong-bao/test/canh-bao-ton-kho
Content-Type: application/json

{
  "maSanPham": 5,
  "tenSanPham": "Ghế gỗ cao cấp",
  "soLuongTon": 3
}
```

---

## 🔧 TÍCH HỢP VỚI HỆ THỐNG

### Tự động tạo thông báo khi có sự kiện

#### 1. Trong `DonHangServiceImpl.java`

```java
@Autowired
private IThongBaoService thongBaoService;

public DonHang createOrder(DonHangRequest request) {
    // ... existing code ...
    DonHang savedOrder = donHangRepository.save(donHang);

    // Tạo thông báo tự động
    thongBaoService.taoThongBaoDonHangMoi(savedOrder.getMaDonHang());

    return savedOrder;
}
```

#### 2. Trong `KhachHangServiceImpl.java`

```java
@Autowired
private IThongBaoService thongBaoService;

@Override
public KhachHang tichDiemVaCapNhatHang(Integer maKhachHang, Integer diemThayDoi) {
    // ... existing code ...

    if (!hangMoi.equals(hangCu)) {
        khachHang.setHangThanhVien(hangMoi);

        // Tạo thông báo VIP upgrade
        thongBaoService.taoThongBaoKhachHangVIP(
            maKhachHang,
            khachHang.getHoTen(),
            hangMoi.getTenHang()
        );
    }

    return khachHangRepository.save(khachHang);
}
```

#### 3. Trong `QuanLyTonKhoServiceImpl.java`

```java
@Autowired
private IThongBaoService thongBaoService;

public void kiemTraTonKho(Integer maSanPham) {
    SanPham sanPham = sanPhamRepository.findById(maSanPham).orElse(null);
    if (sanPham == null) return;

    int soLuongTon = tinhSoLuongTon(maSanPham);

    if (soLuongTon == 0) {
        // Hết hàng
        thongBaoService.taoThongBaoHetHang(maSanPham, sanPham.getTenSanPham());
    } else if (soLuongTon <= 5) {
        // Sắp hết hàng
        thongBaoService.taoThongBaoCanhBaoTonKho(maSanPham, sanPham.getTenSanPham(), soLuongTon);
    }
}
```

---

## 📊 CẤU TRÚC DỮ LIỆU

### ThongBao Entity

```java
{
  "maThongBao": 1,
  "loai": "order",                    // success, warning, error, info, order, customer, inventory
  "tieuDe": "Đơn hàng mới",
  "noiDung": "Đơn hàng #123 đã được tạo",
  "thoiGian": "5 phút trước",         // Auto-calculated
  "daDoc": false,
  "nguoiNhanId": null,                // null = ALL
  "loaiNguoiNhan": "ALL",             // ALL, ADMIN, NHANVIEN
  "ngayTao": "2025-10-19T10:30:00",
  "duongDanHanhDong": "/admin/don-hang/123",
  "doUuTien": "high",                 // high, medium, low, normal
  "lienKetId": 123,
  "loaiLienKet": "DON_HANG"
}
```

### ThongBaoRequest (Create/Update)

```json
{
  "loai": "success",
  "tieuDe": "Tiêu đề thông báo",
  "noiDung": "Nội dung chi tiết",
  "nguoiNhanId": null,
  "loaiNguoiNhan": "ALL",
  "duongDanHanhDong": "/admin/some-path",
  "doUuTien": "normal",
  "lienKetId": 123,
  "loaiLienKet": "DON_HANG"
}
```

### ThongBaoResponse (Frontend format)

```json
{
  "id": 1,
  "loai": "order",
  "tieu_de": "Đơn hàng mới",
  "noi_dung": "Đơn hàng #123 đã được tạo",
  "thoi_gian": "5 phút trước",
  "da_doc": false,
  "nguoi_nhan_id": null,
  "loai_nguoi_nhan": "ALL",
  "ngay_tao": "2025-10-19T10:30:00",
  "duong_dan_hanh_dong": "/admin/don-hang/123",
  "do_uu_tien": "high",
  "lien_ket_id": 123,
  "loai_lien_ket": "DON_HANG",
  "is_high_priority": true,
  "is_for_all": true
}
```

---

## 🎨 LOẠI THÔNG BÁO

| Loại        | Mô tả      | Màu sắc    | Icon |
| ----------- | ---------- | ---------- | ---- |
| `success`   | Thành công | Xanh lá    | ✅   |
| `warning`   | Cảnh báo   | Vàng       | ⚠️   |
| `error`     | Lỗi        | Đỏ         | ❌   |
| `info`      | Thông tin  | Xanh dương | ℹ️   |
| `order`     | Đơn hàng   | Tím        | 🛒   |
| `customer`  | Khách hàng | Cam        | 👤   |
| `inventory` | Tồn kho    | Xám        | 📦   |

---

## 🔐 BẢO MẬT

### Cấu hình trong `SecurityConfig.java`

```java
// Nếu muốn test không cần auth
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/thong-bao/**").permitAll()
    // ... other configs
);

// Nếu yêu cầu authentication
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/thong-bao/**").authenticated()
    // ... other configs
);
```

---

## 🧹 MAINTENANCE

### Xóa thông báo cũ tự động

```http
POST http://localhost:8080/api/v1/thong-bao/maintenance/xoa-cu
```

Response:

```json
{
  "success": true,
  "deleted": 15,
  "message": "Đã soft delete 15 thông báo cũ (>30 ngày)"
}
```

### Xóa vĩnh viễn thông báo đã xóa

```http
POST http://localhost:8080/api/v1/thong-bao/maintenance/xoa-vinh-vien
```

### Scheduled Job (Optional)

Thêm vào `application.properties`:

```properties
# Enable scheduling
spring.task.scheduling.enabled=true
```

Tạo Scheduled Task:

```java
@Configuration
@EnableScheduling
public class NotificationMaintenanceScheduler {

    @Autowired
    private IThongBaoService thongBaoService;

    // Run every day at 2 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldNotifications() {
        System.out.println("[Scheduler] Running notification cleanup...");
        int softDeleted = thongBaoService.xoaThongBaoCu();
        int hardDeleted = thongBaoService.xoaVinhVienThongBaoCu();
        System.out.println("[Scheduler] Cleanup complete: " + softDeleted + " soft deleted, " + hardDeleted + " permanently deleted");
    }
}
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Phase 1: Database ✅

- [x] Tạo bảng `ThongBao`
- [x] Tạo indexes
- [x] Insert dữ liệu mẫu

### Phase 2: Backend Core ✅

- [x] Entity `ThongBao.java`
- [x] Repository `ThongBaoRepository.java`
- [x] DTOs (Request & Response)
- [x] Service Interface `IThongBaoService.java`
- [x] Service Implementation `ThongBaoServiceImpl.java`

### Phase 3: API ✅

- [x] Controller `ThongBaoController.java`
- [x] All CRUD endpoints
- [x] Business logic endpoints
- [x] Test endpoints

### Phase 4: Integration ⏳

- [ ] Tích hợp với `DonHangService`
- [ ] Tích hợp với `KhachHangService`
- [ ] Tích hợp với `QuanLyTonKhoService`
- [ ] Tích hợp với `ThanhToanService`

### Phase 5: Testing ⏳

- [ ] Test tất cả API với Postman
- [ ] Test Frontend integration
- [ ] Test auto-create notifications
- [ ] Performance testing

---

## 🐛 TROUBLESHOOTING

### Lỗi 1: Cannot find ThongBaoRepository

**Giải pháp:**

- Rebuild project: `mvnw clean package`
- Kiểm tra package structure
- Restart IDE

### Lỗi 2: SQL Server connection failed

**Giải pháp:**

```properties
# Kiểm tra application.properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=qlnt_db;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=your_password
```

### Lỗi 3: Table 'ThongBao' doesn't exist

**Giải pháp:**

- Chạy lại script SQL: `create_thongbao_table.sql`
- Hoặc set `spring.jpa.hibernate.ddl-auto=update` trong `application.properties`

### Lỗi 4: Frontend không nhận được data

**Giải pháp:**

- Kiểm tra CORS config trong `CorsConfig.java`
- Kiểm tra API response format (snake_case)
- Check browser console for errors

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:

1. ✅ Database đã có bảng `ThongBao`
2. ✅ Backend đang chạy (`http://localhost:8080`)
3. ✅ Frontend đang chạy (`http://localhost:3000`)
4. ✅ CORS đã được config đúng
5. ✅ API endpoints trả về đúng format

---

## 🎉 HOÀN THÀNH!

Chức năng thông báo đã sẵn sàng sử dụng! 🚀

**Các bước tiếp theo:**

1. Test tất cả API với Postman
2. Tích hợp với frontend
3. Tích hợp auto-create notifications
4. Deploy lên production

Good luck! 💪
