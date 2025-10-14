# Furniture Shop API - Danh sách API Endpoints

## 📋 Tổng quan

- **Tổng số API:** 148 endpoints
- **Base URL:** `http://localhost:8080`
- **Format:** JSON
- **Encoding:** UTF-8

---

## 1️⃣ PRODUCTS & BASIC DATA (47 endpoints)

### 📦 Products (7 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy tất cả sản phẩm |
| GET | `/api/products/{id}` | Lấy sản phẩm theo ID |
| POST | `/api/products` | Tạo sản phẩm mới |
| PUT | `/api/products/{id}` | Cập nhật sản phẩm |
| DELETE | `/api/products/{id}` | Xóa sản phẩm |
| POST | `/api/products/{productId}/variants` | Tạo biến thể cho sản phẩm |
| POST | `/api/products/{productId}/categories/{categoryId}` | Gán sản phẩm vào danh mục |

### 🎨 Biến thể sản phẩm - Variants (10 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/bien-the-san-pham` | Lấy tất cả biến thể (phân trang) |
| GET | `/api/bien-the-san-pham/{id}` | Lấy biến thể theo ID |
| GET | `/api/bien-the-san-pham/san-pham/{maSanPham}` | Lấy biến thể theo sản phẩm |
| GET | `/api/bien-the-san-pham/sku/{sku}` | Tìm biến thể theo SKU |
| GET | `/api/bien-the-san-pham/{id}/chi-tiet` | Lấy chi tiết biến thể |
| POST | `/api/bien-the-san-pham/san-pham/{maSanPham}` | Tạo biến thể |
| PUT | `/api/bien-the-san-pham/{id}` | Cập nhật biến thể |
| DELETE | `/api/bien-the-san-pham/{id}` | Xóa biến thể |
| PATCH | `/api/bien-the-san-pham/{id}/so-luong-ton` | Cập nhật số lượng tồn |
| GET | `/api/bien-the-san-pham/{id}/kiem-tra-ton-kho` | Kiểm tra tồn kho |

### 📂 Categories (8 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Lấy tất cả danh mục |
| GET | `/api/categories/{id}/children` | Lấy danh mục con |
| GET | `/api/categories/{id}/parents` | Lấy danh mục cha |
| POST | `/api/categories` | Tạo danh mục |
| PUT | `/api/categories/{id}` | Cập nhật danh mục |
| DELETE | `/api/categories/{id}` | Xóa danh mục |
| POST | `/api/categories/{childId}/parents/{parentId}` | Liên kết cha-con |
| DELETE | `/api/categories/{childId}/parents/{parentId}` | Hủy liên kết cha-con |

### 🏷️ Attributes (8 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/attributes` | Lấy tất cả thuộc tính |
| POST | `/api/attributes` | Tạo thuộc tính |
| PUT | `/api/attributes/{id}` | Cập nhật thuộc tính |
| DELETE | `/api/attributes/{id}` | Xóa thuộc tính |
| GET | `/api/attributes/{thuocTinhId}/values` | Lấy giá trị thuộc tính |
| POST | `/api/attributes/{thuocTinhId}/values` | Tạo giá trị thuộc tính |
| PUT | `/api/attributes/values/{id}` | Cập nhật giá trị |
| DELETE | `/api/attributes/values/{id}` | Xóa giá trị |

### 🏢 Suppliers (4 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/suppliers` | Lấy tất cả nhà cung cấp |
| POST | `/api/suppliers` | Tạo nhà cung cấp |
| PUT | `/api/suppliers/{id}` | Cập nhật nhà cung cấp |
| DELETE | `/api/suppliers/{id}` | Xóa nhà cung cấp |

### 🎁 Collections (10 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/collections` | Lấy tất cả bộ sưu tập |
| GET | `/api/collections/{id}` | Lấy bộ sưu tập theo ID |
| GET | `/api/collections/{collectionId}/products` | Lấy sản phẩm trong bộ sưu tập |
| POST | `/api/collections` | Tạo bộ sưu tập |
| PUT | `/api/collections/{id}` | Cập nhật bộ sưu tập |
| DELETE | `/api/collections/{id}` | Xóa bộ sưu tập |
| POST | `/api/collections/{collectionId}/products/{productId}` | Thêm sản phẩm vào bộ sưu tập |
| DELETE | `/api/collections/{collectionId}/products/{productId}` | Xóa sản phẩm khỏi bộ sưu tập |

---

## 2️⃣ CUSTOMERS & SALES (25 endpoints)

### 👥 Customers (8 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/khach-hang` | Lấy danh sách khách hàng |
| GET | `/api/v1/khach-hang/{maKhachHang}` | Lấy thông tin khách hàng |
| GET | `/api/v1/khach-hang/search` | Tìm kiếm khách hàng |
| POST | `/api/v1/khach-hang` | Tạo khách hàng |
| PUT | `/api/v1/khach-hang/{maKhachHang}` | Cập nhật khách hàng |
| DELETE | `/api/v1/khach-hang/{maKhachHang}` | Xóa khách hàng |
| PUT | `/api/v1/khach-hang/{maKhachHang}/tich-diem` | Tích điểm (PUT) |
| POST | `/api/v1/khach-hang/tich-diem` | Tích điểm (POST) |

### 🏆 Membership Tiers (8 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/hang-thanh-vien` | Lấy tất cả hạng (phân trang) |
| GET | `/api/hang-thanh-vien/all` | Lấy tất cả hạng (không phân trang) |
| GET | `/api/hang-thanh-vien/{id}` | Lấy hạng theo ID |
| GET | `/api/hang-thanh-vien/thong-ke` | Thống kê hạng |
| POST | `/api/hang-thanh-vien` | Tạo hạng |
| PUT | `/api/hang-thanh-vien/{id}` | Cập nhật hạng |
| DELETE | `/api/hang-thanh-vien/{id}` | Xóa hạng |
| PATCH | `/api/hang-thanh-vien/cap-nhat-hang/{maKhachHang}` | Cập nhật hạng cho KH |

### 🛒 Sales & Orders (7 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/banhang/donhang` | Lấy tất cả đơn hàng |
| GET | `/api/banhang/donhang/{id}` | Lấy đơn hàng theo ID |
| GET | `/api/banhang/thongke` | Thống kê bán hàng |
| GET | `/api/banhang/thong-ke` | Thống kê (với date range) |
| POST | `/api/banhang/donhang` | Tạo đơn hàng |
| PUT | `/api/banhang/donhang/{id}/trangthai` | Cập nhật trạng thái |
| DELETE | `/api/banhang/donhang/{id}` | Xóa đơn hàng |

### 💎 VIP (7 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/vip/levels` | Lấy tất cả cấp VIP |
| GET | `/api/vip/levels/{id}` | Lấy cấp VIP theo ID |
| GET | `/api/vip/customers` | Lấy khách hàng VIP |
| GET | `/api/vip/benefits/preview/{customerId}` | Xem trước quyền lợi |
| POST | `/api/vip/levels` | Tạo cấp VIP |
| PUT | `/api/vip/levels/{id}` | Cập nhật cấp VIP |
| DELETE | `/api/vip/levels/{id}` | Xóa cấp VIP |

---

## 3️⃣ VOUCHERS & DISCOUNTS (33 endpoints)

### 🎫 Voucher (17 endpoints)

**Khách hàng (4 endpoints):**
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/voucher/eligible/{maKhachHang}` | Lấy voucher áp dụng được |
| GET | `/api/v1/voucher/eligible/{maKhachHang}/details` | Lấy voucher chi tiết |
| POST | `/api/v1/voucher/apply` | Áp dụng voucher (đơn giản) |
| POST | `/api/v1/voucher/apply/details` | Áp dụng voucher (chi tiết) |

**Admin (13 endpoints):**
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/voucher` | Lấy tất cả voucher |
| GET | `/api/v1/voucher/all` | Lấy tất cả voucher (all) |
| GET | `/api/v1/voucher/details` | Lấy tất cả (chi tiết) |
| GET | `/api/v1/voucher/{id}` | Lấy voucher theo ID |
| GET | `/api/v1/voucher/{id}/details` | Lấy voucher chi tiết theo ID |
| GET | `/api/v1/voucher/classify` | Phân loại theo hạng |
| GET | `/api/v1/voucher/by-tier/{maHangThanhVien}` | Lấy voucher theo hạng |
| POST | `/api/v1/voucher` | Tạo voucher |
| PUT | `/api/v1/voucher/{id}` | Cập nhật voucher |
| DELETE | `/api/v1/voucher/{id}` | Xóa voucher |
| POST | `/api/v1/voucher/{id}/assign-tiers` | Gán hạng cho voucher |

### 💰 Chương trình giảm giá (13 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/chuongtrinh-giamgia` | Lấy tất cả chương trình |
| GET | `/api/chuongtrinh-giamgia/details` | Lấy tất cả (chi tiết) |
| GET | `/api/chuongtrinh-giamgia/{id}` | Lấy theo ID |
| GET | `/api/chuongtrinh-giamgia/{id}/details` | Lấy chi tiết theo ID |
| GET | `/api/chuongtrinh-giamgia/bien-the/{maBienThe}/gia-hien-thi` | Lấy giá hiển thị |
| GET | `/api/chuongtrinh-giamgia/bien-the/{maBienThe}/gia-chi-tiet` | Lấy chi tiết giá |
| POST | `/api/chuongtrinh-giamgia` | Tạo chương trình |
| POST | `/api/chuongtrinh-giamgia/with-details` | Tạo kèm biến thể |
| POST | `/api/chuongtrinh-giamgia/{maCT}/bien-the/{maBT}` | Thêm biến thể vào CT |
| PUT | `/api/chuongtrinh-giamgia/{id}` | Cập nhật chương trình |
| PUT | `/api/chuongtrinh-giamgia/{id}/with-details` | Cập nhật kèm biến thể |
| DELETE | `/api/chuongtrinh-giamgia/{id}` | Xóa chương trình |
| DELETE | `/api/chuongtrinh-giamgia/{maCT}/bien-the/{maBT}` | Xóa biến thể khỏi CT |

### 🔖 Biến thể giảm giá (7 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/bien-the-giam-gia` | Lấy tất cả (phân trang) |
| GET | `/api/bien-the-giam-gia/chuong-trinh/{maCT}` | Lấy theo chương trình |
| GET | `/api/bien-the-giam-gia/bien-the/{maBienThe}` | Lấy theo biến thể |
| GET | `/api/bien-the-giam-gia/gia-tot-nhat/{maBienThe}` | Lấy giá tốt nhất |
| POST | `/api/bien-the-giam-gia/chuong-trinh/{maCT}` | Thêm biến thể vào CT |
| PUT | `/api/bien-the-giam-gia/chuong-trinh/{maCT}/bien-the/{maBT}` | Cập nhật giá |
| DELETE | `/api/bien-the-giam-gia/chuong-trinh/{maCT}/bien-the/{maBT}` | Xóa biến thể |

---

## 4️⃣ WAREHOUSE & REPORTS (43 endpoints)

### 📦 Quản lý tồn kho (11 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/quan-ly-ton-kho/nhap-kho` | Nhập hàng |
| POST | `/api/v1/quan-ly-ton-kho/xuat-kho` | Xuất hàng |
| POST | `/api/v1/quan-ly-ton-kho/dat-cho` | Đặt chỗ hàng |
| POST | `/api/v1/quan-ly-ton-kho/huy-dat-cho` | Hủy đặt chỗ |
| GET | `/api/v1/quan-ly-ton-kho/thong-tin-ton-kho/{id}` | Thông tin tồn kho |
| GET | `/api/v1/quan-ly-ton-kho/lich-su-ton-kho/{id}` | Lịch sử tồn kho |
| GET | `/api/v1/quan-ly-ton-kho/sap-het-hang` | Sản phẩm sắp hết |
| GET | `/api/v1/quan-ly-ton-kho/het-hang` | Sản phẩm hết hàng |
| GET | `/api/v1/quan-ly-ton-kho/tong-gia-tri` | Tổng giá trị tồn |
| GET | `/api/v1/quan-ly-ton-kho/tong-ket-san-pham` | Tổng kết theo SP |
| GET | `/api/v1/quan-ly-ton-kho/tong-ket-danh-muc` | Tổng kết theo DM |

### 📋 Kiểm kê (9 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/quan-ly-kiem-ke/danh-sach` | Danh sách kiểm kê |
| GET | `/api/v1/quan-ly-kiem-ke/chi-tiet/{id}` | Chi tiết kiểm kê |
| GET | `/api/v1/quan-ly-kiem-ke/dang-thuc-hien` | Kiểm kê đang thực hiện |
| POST | `/api/v1/quan-ly-kiem-ke/tao-kiem-ke` | Tạo phiếu kiểm kê |
| POST | `/api/v1/quan-ly-kiem-ke/tao-kiem-ke-toan-bo` | Tạo kiểm kê toàn bộ |
| POST | `/api/v1/quan-ly-kiem-ke/them-san-pham` | Thêm SP vào phiếu |
| PUT | `/api/v1/quan-ly-kiem-ke/bat-dau-kiem-ke/{id}` | Bắt đầu kiểm kê |
| PUT | `/api/v1/quan-ly-kiem-ke/cap-nhat-so-luong-thuc-te` | Cập nhật SL thực tế |
| PUT | `/api/v1/quan-ly-kiem-ke/hoan-thanh-kiem-ke/{id}` | Hoàn thành kiểm kê |

### 🔄 Quản lý trạng thái đơn hàng (9 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/quan-ly-trang-thai-don-hang/cho-xac-nhan` | ĐH chờ xác nhận |
| GET | `/api/v1/quan-ly-trang-thai-don-hang/dang-giao` | ĐH đang giao |
| GET | `/api/v1/quan-ly-trang-thai-don-hang/lich-su/{id}` | Lịch sử trạng thái |
| PUT | `/api/v1/quan-ly-trang-thai-don-hang/cap-nhat-trang-thai/{id}` | Cập nhật trạng thái |
| POST | `/api/v1/quan-ly-trang-thai-don-hang/{id}/confirm` | Xác nhận ĐH |
| POST | `/api/v1/quan-ly-trang-thai-don-hang/{id}/prepare` | Chuẩn bị ĐH |
| POST | `/api/v1/quan-ly-trang-thai-don-hang/{id}/ship` | Giao hàng |
| POST | `/api/v1/quan-ly-trang-thai-don-hang/{id}/complete` | Hoàn thành |
| POST | `/api/v1/quan-ly-trang-thai-don-hang/{id}/cancel` | Hủy ĐH |

### 📊 Báo cáo thống kê (9 endpoints)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/bao-cao-thong-ke/tong-quan-dashboard` | Tổng quan dashboard |
| GET | `/api/v1/bao-cao-thong-ke/bao-cao-ton-kho` | Báo cáo tồn kho |
| GET | `/api/v1/bao-cao-thong-ke/canh-bao-ton-kho` | Cảnh báo tồn kho |
| GET | `/api/v1/bao-cao-thong-ke/tong-ket-trang-thai-don-hang` | Tổng kết trạng thái |
| GET | `/api/v1/bao-cao-thong-ke/hieu-suat-xu-ly-don-hang` | Hiệu suất xử lý |
| GET | `/api/v1/bao-cao-thong-ke/bao-cao-kiem-ke` | Báo cáo kiểm kê |
| GET | `/api/v1/bao-cao-thong-ke/doanh-thu-theo-thoi-gian` | Doanh thu |
| GET | `/api/v1/bao-cao-thong-ke/thong-ke-khach-hang` | Thống kê KH |
| GET | `/api/v1/bao-cao-thong-ke/top-san-pham-ban-chay` | Top SP bán chạy |

---

## 📝 Ghi chú

### Query Parameters phổ biến
- **Phân trang:** `?page=0&size=10&sortBy=id&sortDir=asc`
- **Tìm kiếm:** `?keyword=search_term`
- **Lọc theo ngày:** `?fromDate=2024-01-01&toDate=2024-12-31`
- **Lọc theo level/tier:** `?level=Vàng`

### Request Body Format
Tất cả request body đều sử dụng JSON format với encoding UTF-8.

### Response Format
```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... }
}
```

### HTTP Status Codes
- `200 OK` - Thành công
- `201 Created` - Tạo mới thành công
- `204 No Content` - Xóa thành công
- `400 Bad Request` - Lỗi validation
- `404 Not Found` - Không tìm thấy
- `500 Internal Server Error` - Lỗi server

---

**Tài liệu này được tự động tạo từ source code controllers**  
**Version:** 1.0.0 | **Last Updated:** October 2024
