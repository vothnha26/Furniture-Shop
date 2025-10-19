-- Thêm các cột mới vào bảng KhachHang để hỗ trợ thông tin cá nhân đầy đủ

-- Thêm cột NgaySinh
ALTER TABLE KhachHang 
ADD COLUMN NgaySinh DATE NULL;

-- Thêm cột GioiTinh
ALTER TABLE KhachHang 
ADD COLUMN GioiTinh VARCHAR(20) NULL;

-- Cập nhật dữ liệu mẫu nếu cần
UPDATE KhachHang 
SET GioiTinh = 'male' 
WHERE GioiTinh IS NULL;

-- Thêm comment để giải thích các giá trị
ALTER TABLE KhachHang 
MODIFY COLUMN GioiTinh VARCHAR(20) 
COMMENT 'Giới tính: male, female, other';