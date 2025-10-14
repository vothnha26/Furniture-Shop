# Entities usage and missing table notes

Generated: 2025-10-12

This document lists all Java entity files currently present under `src/entity`, describes which other entities they reference ("uses") and which entities reference them ("used by"), and notes missing entities that should be added for Module 2 (Sales & Order Management).

Purpose: the product owner or frontend team can use this to annotate UI views with which tables to call; backend devs can see which entities are present and which are missing.

---

## Summary (existing files scanned from folder)

The following files were found in `src/entity` (as provided by the attachment):

- BienTheGiamGia.java
- BienTheGiaTriThuocTinh.java
```markdown
# Ghi chú sử dụng Entities và bảng thiếu

Đã tạo: 2025-10-12

Tài liệu này liệt kê tất cả các file entity Java hiện có trong `src/entity`, mô tả các entity khác mà chúng tham chiếu ("sử dụng") và các entity tham chiếu tới chúng ("được sử dụng bởi"), đồng thời ghi chú những bảng/entity cần thêm cho Module 2 (Quản lý Bán hàng & Đơn hàng).

Mục đích: product owner hoặc frontend team dùng file này để gắn nhãn giao diện với các bảng cần gọi; backend devs dùng để biết entity nào đã có và entity nào đang thiếu.

---

## Tóm tắt (các file hiện có trong thư mục)

Các file sau được tìm thấy trong `src/entity` (theo attachment):

- BienTheGiamGia.java
- BienTheGiaTriThuocTinh.java
- BienTheSanPham.java
- BoSuuTap.java
- ChiTietDonHang.java
- ChiTietGioHang.java
- ChuongTrinhGiamGia.java
- DanhMuc.java
- DiaChiGiaoHang.java
- DichVu.java
- DoiTacVanChuyen.java
- DonHang.java
- DonHangDichVu.java
- GiaoDichThanhToan.java
- GiaTriThuocTinh.java
- GioHang.java
- HangThanhVien.java
- HoaDon.java
- KhachHang.java
- LichSuDiemThuong.java
- NhaCungCap.java
- NhanVien.java
- SanPham.java
- TaiKhoan.java
- ThongTinGiaoHang.java
- ThuocTinh.java
- VaiTro.java
- Voucher.java
- VoucherHangThanhVien.java


## Ghi chú nhanh: các entity/bảng còn thiếu (phát hiện / khuyến nghị)

Dựa trên yêu cầu Module Quản lý Bán hàng & Đơn hàng và các file hiện có, có hai entity quan trọng chưa có và nên được thêm vào:

1. `LichSuTrangThaiDonHang.java` (Lịch sử trạng thái đơn hàng)
   - Mục đích: lưu lại mọi thay đổi trạng thái của `DonHang` (ví dụ: PENDING -> CONFIRMED -> SHIPPING -> COMPLETED)
   - Tại sao cần: Nếu thiếu, khó hiện timeline đơn hàng trên UI, audit trail cho admin, hoặc trigger thông báo tự động dựa trên thay đổi trạng thái.

2. `ThongBaoDonHang.java` (Thông báo đơn hàng)
   - Mục đích: lưu thông báo (email/SMS/push) đã gửi tới khách hàng liên quan tới đơn hàng
   - Tại sao cần: Nếu thiếu, không theo dõi được việc gửi thông báo, không retry khi thất bại, và không hiển thị lịch sử thông báo trên UI.

> Lưu ý: Các entity khác như `GioHang`, `ChiTietGioHang`, `DiaChiGiaoHang`, `DoiTacVanChuyen` đã có trong thư mục, nên chỉ 2 entity trên là đang thiếu.

---

## Ghi chú sử dụng theo từng entity

Mỗi mục dưới đây gồm hai phần: `Sử dụng` (entity nào nó tham chiếu) và `Được sử dụng bởi` (entity nào thường tham chiếu tới nó). Những thông tin này dựa trên mối quan hệ phổ biến; xác nhận tên trường thực tế trong code khi bạn map API.

### `BienTheSanPham.java`
- Sử dụng: `SanPham`, `BienTheGiaTriThuocTinh` (giá trị thuộc tính biến thể)
- Được sử dụng bởi: `ChiTietDonHang`, `ChiTietGioHang`
- Ghi chú UI: trang chi tiết sản phẩm nên gọi `BienTheSanPham` để hiển thị tồn kho, giá, ảnh.

### `ChiTietDonHang.java`
- Sử dụng: `DonHang`, `BienTheSanPham`, `GiaTriThuocTinh`
- Được sử dụng bởi: `HoaDon` (tạo hóa đơn), báo cáo
- Ghi chú UI: trang chi tiết đơn hàng dùng để hiện các line item.

### `ChiTietGioHang.java`
- Sử dụng: `GioHang`, `BienTheSanPham`
- Được sử dụng bởi: API giỏ hàng, luồng Checkout
- Ghi chú UI: mini-cart và cart page đọc/ghi các dòng này.

### `GioHang.java`
- Sử dụng: `KhachHang` (owner), chứa danh sách `ChiTietGioHang`
- Được sử dụng bởi: Checkout service, CartController
- Ghi chú UI: persistent cart nên map tới entity này.

### `DiaChiGiaoHang.java`
- Sử dụng: `KhachHang`
- Được sử dụng bởi: `DonHang` (lưu snapshot địa chỉ hoặc FK), Checkout UI
- Ghi chú UI: phần quản lý địa chỉ (address book) gọi API `DiaChiGiaoHang`.

### `DoiTacVanChuyen.java`
- Sử dụng: có thể chỉ chứa cấu hình bên ngoài (apiUrl, apiKey)
- Được sử dụng bởi: chọn đối tác vận chuyển khi checkout và quản lý đơn hàng
- Ghi chú UI: hiển thị danh sách đối tác vận chuyển và phí ước tính.

### `DonHang.java`
- Sử dụng: `KhachHang`, `ThongTinGiaoHang` hoặc `DiaChiGiaoHang` (snapshot), `GiaoDichThanhToan`, danh sách `ChiTietDonHang`
- Được sử dụng bởi: OrderManagement, Invoice, Shipping
- Ghi chú UI: danh sách đơn, chi tiết đơn, trang admin chỉnh sửa đơn.

### `ThongTinGiaoHang.java`
- Sử dụng: `DonHang` (nếu tách riêng) hoặc dùng như embeddable
- Được sử dụng bởi: `DonHang` như snapshot
- Ghi chú UI: thông tin giao hàng sau khi đặt có thể hiển thị dưới dạng snapshot.

### `GiaoDichThanhToan.java`
- Sử dụng: `DonHang`, `HoaDon`
- Được sử dụng bởi: lịch sử thanh toán, xử lý refund
- Ghi chú UI: chi tiết giao dịch thanh toán.

### `HoaDon.java`
- Sử dụng: `DonHang`, `GiaoDichThanhToan`
- Được sử dụng bởi: bộ phận kế toán, tải hóa đơn cho khách hàng

### `KhachHang.java`
- Sử dụng: `TaiKhoan`, có thể có nhiều `DiaChiGiaoHang`, `GioHang`
- Được sử dụng bởi: hầu hết API cho khách hàng

### `NhanVien.java`
- Sử dụng: `VaiTro`, `TaiKhoan`
- Được sử dụng bởi: `DonHang` (nhân viên xử lý), audit trail

### `LichSuDiemThuong.java`
- Sử dụng: `KhachHang`
- Được sử dụng bởi: UI điểm thưởng

### `Voucher`, `ChuongTrinhGiamGia`, `VoucherHangThanhVien`, `BienTheGiamGia`
- Sử dụng: liên quan sản phẩm và thành viên
- Được sử dụng bởi: engine khuyến mãi khi checkout

### `ThuocTinh`, `GiaTriThuocTinh`, `BienTheGiaTriThuocTinh`
- Sử dụng: `SanPham`
- Được sử dụng bởi: cấu thành biến thể sản phẩm và lọc

---

## Khuyến nghị để gắn nhãn UI

- Cart UI (mini-cart, trang giỏ) → gọi: `GioHang` → `ChiTietGioHang`
- Checkout address selector → gọi: `DiaChiGiaoHang` (danh sách) và `DonHang` (create payload)
- Order timeline → gọi: `DonHang` + (PHẢI CÓ) `LichSuTrangThaiDonHang` (thêm bảng này)
- Lịch sử thông báo của đơn → gọi: (PHẢI CÓ) `ThongBaoDonHang` (thêm bảng này)
- Selector đối tác vận chuyển → gọi: `DoiTacVanChuyen`

---

## Các file đã thêm (stubs đã tạo)
- `LichSuTrangThaiDonHang.java`  (tạo stub entity)
- `ThongBaoDonHang.java`        (tạo stub entity)

Stubs chứa JPA + Lombok tối thiểu để IDE nhận diện và có thể mở rộng sau.

---

## Cách sử dụng file này
- Frontend devs: dùng phần `Ghi chú UI` và `Khuyến nghị` để map API và hiển thị.
- Backend devs: mở rộng các stub entity, thêm repository và controller tương ứng.

Muốn tôi chèn comment ngắn ở đầu mỗi file Java mô tả mối quan hệ chính không? Trả lời `annotate` nếu muốn tôi thực hiện bước nhỏ này.

```
