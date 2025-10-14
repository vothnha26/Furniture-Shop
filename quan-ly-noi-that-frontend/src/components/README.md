# 📁 Cấu trúc Components theo Role

## 🎯 Tổ chức theo 3 roles chính

### 👑 Admin (`/admin`)
**Quản lý hệ thống và dữ liệu cấp cao**
- `AccountManagement.js` - Quản lý tài khoản
- `AttributeManagement.js` - Quản lý thuộc tính
- `AttributeValueManagement.js` - Giá trị thuộc tính
- `BackupRestore.js` - Sao lưu & phục hồi
- `CategoryManagement.js` - Quản lý danh mục
- `CollectionManagement.js` - Quản lý bộ sưu tập
- `CustomerManagement.js` - Quản lý khách hàng
- `Dashboard.js` - Dashboard admin
- `DiscountManagement.js` - Quản lý giảm giá
- `Notifications.js` - Thông báo hệ thống
- `ProductManagement.js` - Quản lý sản phẩm
- `ProductVariantManagement.js` - Biến thể sản phẩm
- `PromotionManagement.js` - Quản lý khuyến mãi
- `ReportsAnalytics.js` - Báo cáo & thống kê
- `Settings.js` - Cài đặt hệ thống
- `VIPManagement.js` - Quản lý VIP
- `VoucherManagement.js` - Quản lý voucher

### 👤 Customer (`/customer`)
**Giao diện người dùng cuối**
- `CustomerCart.js` - Giỏ hàng
- `CustomerChat.js` - Chat hỗ trợ
- `CustomerCheckout.js` - Thanh toán
- `CustomerFavorites.js` - Sản phẩm yêu thích
- `CustomerLayout.js` - Layout khách hàng
- `CustomerNotifications.js` - Thông báo khách hàng
- `CustomerOrders.js` - Đơn hàng của tôi
- `CustomerOrderTracking.js` - Theo dõi đơn hàng
- `CustomerProductDetail.js` - Chi tiết sản phẩm
- `CustomerProfile.js` - Trang cá nhân
- `CustomerShop.js` - Trang cửa hàng
- `CustomerShopPage.js` - Danh sách sản phẩm

### 👨‍💼 Staff (`/staff`)
**Công cụ làm việc cho nhân viên**
- `CustomerSupport.js` - Hỗ trợ khách hàng
- `InventoryAlerts.js` - Cảnh báo tồn kho
- `InventoryManagement.js` - Quản lý kho
- `InvoiceManagement.js` - Quản lý hóa đơn
- `OrderDetailManagement.js` - Chi tiết đơn hàng
- `OrderManagement.js` - Quản lý đơn hàng
- `PaymentTransactionManagement.js` - Giao dịch thanh toán
- `SalesManagement.js` - Quản lý bán hàng
- `ShippingInfoManagement.js` - Thông tin giao hàng
- `ShippingTracking.js` - Theo dõi vận chuyển
- `StaffDashboard.js` - Dashboard nhân viên
- `StaffLayout.js` - Layout nhân viên

### 🤝 Shared (`/shared`)
**Components dùng chung cho tất cả roles**
- UI Components: `Modal.js`, `ConfirmDialog.js`, `DataTable.js`, `Toast.js`, `Loading.js`, `EmptyState.js`, `ErrorBoundary.js`, `FileUpload.js`
- Homepage Components: `Header.js`, `Footer.js`, `Hero.js`, `Features.js`, `FeaturesSecond.js`, `Stats.js`
- Layout Components: `MainDashboard.js`, `MainLayout.js`
- Product Display: `NewItems.js`, `NewItemsSlider.js`, `ProductSlider.js`, `Products.js`
- Other: `Newsletter.js`, `Pagination.js`, `Search.js`, `Testimonial.js`, `TestimonialSlider.js`

## 🔄 Role Navigation

### Admin Navigation
- Dropdown chọn người phụ trách (Phúc, Nhã, Lộc)
- Dropdown chọn chức năng theo từng người

### Staff Navigation  
- Dashboard nhân viên
- Quản lý kho hàng
- Quản lý đơn hàng
- Hỗ trợ khách hàng

### Customer Navigation
- Cửa hàng
- Giỏ hàng
- Đơn hàng của tôi  
- Trang cá nhân

## 🎨 Color Coding
- **Admin**: Blue (`bg-blue-600`)
- **Staff**: Green (`bg-green-600`) 
- **Customer**: Purple (`bg-purple-600`)