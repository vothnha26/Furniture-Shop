# 📋 KẾ HOẠCH TRIỂN KHAI CHỨC NĂNG THÔNG BÁO CHO ADMIN

## 🎯 Mục tiêu

Tạo đầy đủ chức năng thông báo (Notifications) cho hệ thống quản lý nội thất, bao gồm:

- Backend API (Spring Boot + SQL Server)
- Frontend đã có sẵn (React)
- Tích hợp với hệ thống hiện tại

---

## 📊 PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### 1. Frontend (React) - ĐÃ CÓ SẴN ✅

**File:** `src/components/admin/system/Notifications.js`

**Các API Frontend đang gọi:**

```javascript
// 1. Lấy danh sách thông báo
GET / api / v1 / thong - bao;

// 2. Đánh dấu đã đọc (1 thông báo)
PUT / api / v1 / thong - bao / { id } / danh - dau - da - doc;

// 3. Đánh dấu tất cả đã đọc
PUT / api / v1 / thong - bao / danh - dau - tat - ca - da - doc;

// 4. Xóa thông báo
DELETE / api / v1 / thong - bao / { id };
```

**Cấu trúc dữ liệu Frontend mong đợi:**

```javascript
{
  id: Integer,
  loai: String,           // 'success', 'warning', 'error', 'info', 'order', 'customer', 'inventory'
  tieu_de: String,
  noi_dung: String,
  thoi_gian: String,      // Human-readable time
  da_doc: Boolean,
  nguoi_nhan_id: Integer, // ID của người nhận (Admin/NhanVien)
  ngay_tao: LocalDateTime,
  duong_dan_hanh_dong: String,  // URL để navigate khi click
  do_uu_tien: String      // 'high', 'medium', 'low', 'normal'
}
```

### 2. Backend - CẦN TẠO MỚI ❌

**Cấu trúc project hiện tại:**

```
backend/
├── entity/          ← Cần tạo: ThongBao.java
├── repository/      ← Cần tạo: ThongBaoRepository.java
├── service/
│   ├── interface/   ← Cần tạo: IThongBaoService.java
│   └── impl/        ← Cần tạo: ThongBaoServiceImpl.java
├── controller/      ← Cần tạo: ThongBaoController.java
├── dto/
│   ├── request/     ← Cần tạo: ThongBaoRequest.java
│   └── response/    ← Cần tạo: ThongBaoResponse.java
└── exception/       ← Đã có GlobalExceptionHandler.java
```

---

## 🗂️ DATABASE SCHEMA

### Bảng: `ThongBao`

```sql
CREATE TABLE ThongBao (
    MaThongBao INT IDENTITY(1,1) PRIMARY KEY,
    Loai NVARCHAR(50) NOT NULL,                    -- 'success', 'warning', 'error', 'info', 'order', 'customer', 'inventory'
    TieuDe NVARCHAR(255) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    ThoiGian NVARCHAR(100),                        -- Human-readable: '5 phút trước', '1 giờ trước'
    DaDoc BIT DEFAULT 0,
    NguoiNhanId INT,                               -- Có thể là MaNhanVien hoặc MaTaiKhoan
    LoaiNguoiNhan NVARCHAR(20),                    -- 'ADMIN', 'NHANVIEN', 'ALL'
    NgayTao DATETIME2 DEFAULT GETDATE(),
    DuongDanHanhDong NVARCHAR(500),                -- URL: '/admin/don-hang/123'
    DoUuTien NVARCHAR(20) DEFAULT 'normal',        -- 'high', 'medium', 'low', 'normal'

    -- Metadata
    LienKetId INT,                                 -- ID của entity liên quan (MaDonHang, MaKhachHang, etc.)
    LoaiLienKet NVARCHAR(50),                      -- 'DON_HANG', 'KHACH_HANG', 'SAN_PHAM', 'TON_KHO'

    -- Audit fields
    NgayCapNhat DATETIME2,
    NgayXoa DATETIME2,                             -- Soft delete

    INDEX IDX_NguoiNhan (NguoiNhanId, LoaiNguoiNhan),
    INDEX IDX_DaDoc (DaDoc),
    INDEX IDX_NgayTao (NgayTao DESC)
);
```

---

## 🔧 TRIỂN KHAI BACKEND

### 1. Entity: `ThongBao.java`

**Quy ước đặt tên (theo pattern hiện tại):**

- Table name: CamelCase Vietnamese (`ThongBao`)
- Column names: PascalCase Vietnamese (`TieuDe`, `NoiDung`, `DaDoc`)
- Java fields: camelCase Vietnamese (`tieuDe`, `noiDung`, `daDoc`)
- Relationships: ManyToOne với LAZY fetch
- Annotations: Lombok (@Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor)

**Features:**

- Hỗ trợ nhiều loại thông báo (success, warning, error, info, order, customer, inventory)
- Phân quyền người nhận (ALL, ADMIN, NHANVIEN specific)
- Liên kết với entities khác (DonHang, KhachHang, SanPham)
- Soft delete với NgayXoa
- Tự động tính toán thời gian hiển thị

### 2. Repository: `ThongBaoRepository.java`

**Extends:** `JpaRepository<ThongBao, Integer>`

**Query methods cần thiết:**

```java
// Lấy thông báo theo người nhận
List<ThongBao> findByNguoiNhanIdAndNgayXoaIsNullOrderByNgayTaoDesc(Integer nguoiNhanId);

// Lấy thông báo cho ALL
List<ThongBao> findByLoaiNguoiNhanAndNgayXoaIsNullOrderByNgayTaoDesc(String loaiNguoiNhan);

// Đếm thông báo chưa đọc
long countByNguoiNhanIdAndDaDocFalseAndNgayXoaIsNull(Integer nguoiNhanId);
long countByLoaiNguoiNhanAndDaDocFalseAndNgayXoaIsNull(String loaiNguoiNhan);

// Lấy theo loại
List<ThongBao> findByLoaiAndNgayXoaIsNullOrderByNgayTaoDesc(String loai);

// Lấy theo độ ưu tiên
List<ThongBao> findByDoUuTienAndNgayXoaIsNullOrderByNgayTaoDesc(String doUuTien);

// Custom query với @Query nếu cần
@Query("SELECT t FROM ThongBao t WHERE ...")
```

### 3. Service Interface: `IThongBaoService.java`

```java
public interface IThongBaoService {
    // CRUD
    List<ThongBao> getAll();
    List<ThongBao> getByNguoiNhan(Integer nguoiNhanId, String loaiNguoiNhan);
    ThongBao getById(Integer id);
    ThongBao create(ThongBaoRequest request);
    ThongBao update(Integer id, ThongBaoRequest request);
    void delete(Integer id);

    // Business logic
    void danhDauDaDoc(Integer id);
    void danhDauTatCaDaDoc(Integer nguoiNhanId, String loaiNguoiNhan);
    long countChuaDoc(Integer nguoiNhanId, String loaiNguoiNhan);

    // Tạo thông báo tự động
    void taoThongBaoDonHangMoi(Integer maDonHang);
    void taoThongBaoCanhBaoTonKho(Integer maSanPham);
    void taoThongBaoKhachHangVIP(Integer maKhachHang);
    void taoThongBaoThanhToan(Integer maDonHang);
}
```

### 4. Service Implementation: `ThongBaoServiceImpl.java`

**Patterns theo project:**

- Inject repositories qua constructor
- Sử dụng `@Transactional` cho operations modify data
- Throw `ResourceNotFoundException` khi không tìm thấy
- Log errors với `System.err.println()`
- Tính toán thời gian hiển thị (helper method)

**Tính năng đặc biệt:**

```java
// Helper: Tính thời gian hiển thị
private String tinhThoiGianHienThi(LocalDateTime ngayTao) {
    long minutes = ChronoUnit.MINUTES.between(ngayTao, LocalDateTime.now());
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return minutes + " phút trước";
    long hours = minutes / 60;
    if (hours < 24) return hours + " giờ trước";
    long days = hours / 24;
    return days + " ngày trước";
}

// Auto-create notification when order created
@Transactional
public void taoThongBaoDonHangMoi(Integer maDonHang) {
    DonHang donHang = donHangRepository.findById(maDonHang).orElseThrow();

    ThongBao thongBao = new ThongBao();
    thongBao.setLoai("order");
    thongBao.setTieuDe("Đơn hàng mới");
    thongBao.setNoiDung("Đơn hàng #" + maDonHang + " đã được tạo thành công");
    thongBao.setLoaiNguoiNhan("ALL");
    thongBao.setDuongDanHanhDong("/admin/don-hang/" + maDonHang);
    thongBao.setDoUuTien("high");
    thongBao.setLienKetId(maDonHang);
    thongBao.setLoaiLienKet("DON_HANG");

    thongBaoRepository.save(thongBao);
}
```

### 5. Controller: `ThongBaoController.java`

**Base path:** `/api/v1/thong-bao`

**Endpoints:**

```java
@RestController
@RequestMapping("/api/v1/thong-bao")
public class ThongBaoController {

    // GET /api/v1/thong-bao - Lấy tất cả thông báo
    @GetMapping
    public ResponseEntity<List<ThongBao>> getAll();

    // GET /api/v1/thong-bao/{id} - Lấy 1 thông báo
    @GetMapping("/{id}")
    public ResponseEntity<ThongBao> getById(@PathVariable Integer id);

    // GET /api/v1/thong-bao/me - Lấy thông báo của người đang đăng nhập
    @GetMapping("/me")
    public ResponseEntity<List<ThongBao>> getMyNotifications(Principal principal);

    // POST /api/v1/thong-bao - Tạo thông báo mới
    @PostMapping
    public ResponseEntity<ThongBao> create(@Valid @RequestBody ThongBaoRequest request);

    // PUT /api/v1/thong-bao/{id}/danh-dau-da-doc - Đánh dấu đã đọc
    @PutMapping("/{id}/danh-dau-da-doc")
    public ResponseEntity<Void> danhDauDaDoc(@PathVariable Integer id);

    // PUT /api/v1/thong-bao/danh-dau-tat-ca-da-doc - Đánh dấu tất cả đã đọc
    @PutMapping("/danh-dau-tat-ca-da-doc")
    public ResponseEntity<Void> danhDauTatCaDaDoc(Principal principal);

    // DELETE /api/v1/thong-bao/{id} - Xóa thông báo (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id);

    // GET /api/v1/thong-bao/chua-doc/count - Đếm thông báo chưa đọc
    @GetMapping("/chua-doc/count")
    public ResponseEntity<Long> countChuaDoc(Principal principal);
}
```

### 6. DTOs

**ThongBaoRequest.java:**

```java
@Data
public class ThongBaoRequest {
    @NotBlank(message = "Loại thông báo không được để trống")
    private String loai;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String tieuDe;

    @NotBlank(message = "Nội dung không được để trống")
    private String noiDung;

    private Integer nguoiNhanId;

    @NotBlank(message = "Loại người nhận không được để trống")
    private String loaiNguoiNhan; // 'ALL', 'ADMIN', 'NHANVIEN'

    private String duongDanHanhDong;
    private String doUuTien;
    private Integer lienKetId;
    private String loaiLienKet;
}
```

**ThongBaoResponse.java:**

```java
@Data
@Builder
public class ThongBaoResponse {
    private Integer id;
    private String loai;
    private String tieuDe;
    private String noiDung;
    private String thoiGian;
    private Boolean daDoc;
    private Integer nguoiNhanId;
    private String loaiNguoiNhan;
    private LocalDateTime ngayTao;
    private String duongDanHanhDong;
    private String doUuTien;
    private Integer lienKetId;
    private String loaiLienKet;
}
```

---

## 🔄 TÍCH HỢP VỚI HỆ THỐNG

### Tự động tạo thông báo khi:

1. **Đơn hàng mới** (`DonHangServiceImpl.java`)

```java
@Autowired
private IThongBaoService thongBaoService;

public DonHang createOrder(...) {
    // ... existing code ...
    DonHang savedOrder = donHangRepository.save(donHang);

    // Tạo thông báo
    thongBaoService.taoThongBaoDonHangMoi(savedOrder.getMaDonHang());

    return savedOrder;
}
```

2. **Cảnh báo tồn kho** (`QuanLyTonKhoServiceImpl.java`)

```java
public void kiemTraTonKho(Integer maSanPham) {
    // ... check inventory ...
    if (soLuongTon < nguongCanhBao) {
        thongBaoService.taoThongBaoCanhBaoTonKho(maSanPham);
    }
}
```

3. **Khách hàng VIP** (`KhachHangServiceImpl.java`)

```java
public KhachHang tichDiemVaCapNhatHang(...) {
    // ... existing code ...
    if (hangThanhVienChanged) {
        thongBaoService.taoThongBaoKhachHangVIP(khachHang.getMaKhachHang());
    }
    // ...
}
```

4. **Thanh toán thành công** (`ThanhToanServiceImpl.java`)

```java
public void processPayment(...) {
    // ... existing code ...
    if (paymentSuccess) {
        thongBaoService.taoThongBaoThanhToan(maDonHang);
    }
}
```

---

## 🔐 BẢO MẬT VÀ PHÂN QUYỀN

### SecurityConfig.java

```java
// Thêm vào permitAll() nếu cần test không auth
.requestMatchers("/api/v1/thong-bao/**").permitAll()

// Hoặc yêu cầu authentication
.requestMatchers("/api/v1/thong-bao/**").authenticated()
```

### Authorization trong Controller

```java
// Kiểm tra user chỉ xem thông báo của mình
@GetMapping("/me")
public ResponseEntity<List<ThongBao>> getMyNotifications(Principal principal) {
    if (principal == null) {
        return ResponseEntity.status(401).build();
    }

    String username = principal.getName();
    // Get user info and fetch notifications
    // ...
}
```

---

## 📝 TESTING CHECKLIST

### Backend API Tests:

- [ ] GET /api/v1/thong-bao - Lấy tất cả thông báo
- [ ] GET /api/v1/thong-bao/{id} - Lấy 1 thông báo
- [ ] GET /api/v1/thong-bao/me - Lấy thông báo của user
- [ ] POST /api/v1/thong-bao - Tạo thông báo mới
- [ ] PUT /api/v1/thong-bao/{id}/danh-dau-da-doc - Mark as read
- [ ] PUT /api/v1/thong-bao/danh-dau-tat-ca-da-doc - Mark all as read
- [ ] DELETE /api/v1/thong-bao/{id} - Xóa thông báo
- [ ] GET /api/v1/thong-bao/chua-doc/count - Đếm chưa đọc

### Integration Tests:

- [ ] Tạo đơn hàng → Thông báo tự động
- [ ] Tồn kho thấp → Cảnh báo tự động
- [ ] Khách VIP upgrade → Thông báo tự động
- [ ] Thanh toán thành công → Thông báo tự động

### Frontend Tests:

- [ ] Hiển thị danh sách thông báo
- [ ] Filter theo loại
- [ ] Đánh dấu đã đọc
- [ ] Xóa thông báo
- [ ] Realtime update (polling 30s)

---

## 🚀 TRIỂN KHAI THEO BƯỚC

### Phase 1: Core Backend (Ngày 1)

1. ✅ Tạo Entity `ThongBao.java`
2. ✅ Tạo Repository `ThongBaoRepository.java`
3. ✅ Tạo DTOs (Request + Response)
4. ✅ Tạo Service Interface + Implementation
5. ✅ Test Service layer

### Phase 2: API Endpoints (Ngày 2)

1. ✅ Tạo Controller với tất cả endpoints
2. ✅ Test với Postman
3. ✅ Verify CORS và authentication
4. ✅ Test với Frontend

### Phase 3: Integration (Ngày 3)

1. ✅ Tích hợp với DonHangService
2. ✅ Tích hợp với QuanLyTonKhoService
3. ✅ Tích hợp với KhachHangService
4. ✅ Test end-to-end

### Phase 4: Polish (Ngày 4)

1. ✅ Optimization (indexes, caching)
2. ✅ Error handling
3. ✅ Documentation
4. ✅ Final testing

---

## 📚 TÀI LIỆU THAM KHẢO

### Code Style Conventions (từ project hiện tại):

```java
// Entity
@Entity
@Table(name = "ThongBao")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ThongBao { ... }

// Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Integer> { ... }

// Service
public interface IThongBaoService { ... }

// Controller
@RestController
@RequestMapping("/api/v1/thong-bao")
public class ThongBaoController { ... }
```

### Naming Conventions:

- **Tables:** PascalCase Vietnamese (ThongBao, DonHang)
- **Columns:** PascalCase Vietnamese (TieuDe, NoiDung)
- **Java Fields:** camelCase Vietnamese (tieuDe, noiDung)
- **API Paths:** kebab-case Vietnamese (/thong-bao, /danh-dau-da-doc)
- **JSON Fields:** snake_case Vietnamese (tieu_de, noi_dung)

---

## ✅ READY TO IMPLEMENT!

Tất cả thông tin cần thiết đã được chuẩn bị. Chúng ta có thể bắt đầu triển khai ngay:

1. ✅ Database schema
2. ✅ Entity structure
3. ✅ Repository methods
4. ✅ Service logic
5. ✅ Controller endpoints
6. ✅ DTOs
7. ✅ Integration points
8. ✅ Testing plan

**Bước tiếp theo:** Bạn có muốn tôi bắt đầu tạo code không? 🚀
