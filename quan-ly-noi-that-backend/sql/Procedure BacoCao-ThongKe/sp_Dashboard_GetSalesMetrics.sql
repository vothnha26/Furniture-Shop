-- =============================================
-- Description: Lấy các số liệu thống kê bán hàng trong ngày.
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetSalesMetrics
AS
BEGIN
    SET NOCOUNT ON;

    -- Doanh thu hôm nay (chỉ tính đơn hàng đã hoàn thành)
    DECLARE @RevenueToday NUMERIC(18, 2) = (
        SELECT COALESCE(SUM(thanhTien), 0)
        FROM dbo.DonHang
        WHERE CAST(ngayDatHang AS DATE) = CAST(GETDATE() AS DATE)
          AND trangThaiDonHang = 'COMPLETED'
    );

    -- Số đơn hàng hôm nay (trừ đơn đã hủy)
    DECLARE @OrdersToday INT = (
        SELECT COUNT(maDonHang)
        FROM dbo.DonHang
        WHERE CAST(ngayDatHang AS DATE) = CAST(GETDATE() AS DATE)
          AND trangThaiDonHang != 'CANCELLED'
    );

    -- Giá trị đơn hàng trung bình
    DECLARE @AverageOrderValue NUMERIC(18, 2) = (
        SELECT CASE
            WHEN COUNT(maDonHang) > 0 THEN COALESCE(SUM(thanhTien), 0) / COUNT(maDonHang)
            ELSE 0
        END
        FROM dbo.DonHang
        WHERE trangThaiDonHang = 'COMPLETED'
    );

    -- Trả về kết quả
    SELECT
        @RevenueToday AS revenueToday,
        @OrdersToday AS ordersToday,
        @AverageOrderValue AS averageOrderValue,
        '5.2%' AS conversionRate; -- Placeholder, cần hệ thống tracking phức tạp hơn
END
GO