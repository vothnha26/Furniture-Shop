-- =============================================
-- Description: Lấy các số liệu thống kê tổng quan cho Dashboard.
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetOverviewMetrics
AS
BEGIN
    SET NOCOUNT ON;

    -- Tính tổng doanh thu từ các đơn hàng đã hoàn thành
    DECLARE @TotalRevenue NUMERIC(18, 2) = (
        SELECT COALESCE(SUM(thanhTien), 0)
        FROM dbo.DonHang
        WHERE trangThaiDonHang = 'COMPLETED'
    );

    -- Đếm tổng số đơn hàng (trừ các đơn đã hủy)
    DECLARE @TotalOrders INT = (
        SELECT COUNT(maDonHang)
        FROM dbo.DonHang
        WHERE trangThaiDonHang != 'CANCELLED'
    );

    -- Đếm tổng số khách hàng
    DECLARE @TotalCustomers INT = (
        SELECT COUNT(maKhachHang)
        FROM dbo.KhachHang
    );

    -- Đếm tổng số sản phẩm (phân biệt)
    DECLARE @TotalProducts INT = (
        SELECT COUNT(maSanPham)
        FROM dbo.SanPham
    );

    -- Trả về kết quả
    SELECT
        @TotalRevenue AS totalRevenue,
        @TotalOrders AS totalOrders,
        @TotalCustomers AS totalCustomers,
        @TotalProducts AS totalProducts;
END
GO