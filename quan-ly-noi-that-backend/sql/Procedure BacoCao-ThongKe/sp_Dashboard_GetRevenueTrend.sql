-- =============================================
-- Description: Lấy dữ liệu xu hướng doanh thu theo từng ngày.
-- Parameters:
--   @Days: Số ngày gần nhất cần thống kê (ví dụ: 7, 30, 90).
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetRevenueTrend
    @Days INT = 30 -- Mặc định là 30 ngày
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CAST(ngayDatHang AS DATE) AS Ngay,
        SUM(thanhTien) AS DoanhThu
    FROM
        dbo.DonHang
    WHERE
        trangThaiDonHang = 'COMPLETED' -- Chỉ tính các đơn đã hoàn thành
        AND ngayDatHang >= DATEADD(day, -@Days, GETDATE())
    GROUP BY
        CAST(ngayDatHang AS DATE)
    ORDER BY
        Ngay ASC;
END
GO