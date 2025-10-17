-- =============================================
-- Description: Lấy ngày có doanh thu cao nhất và thấp nhất.
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetRevenueSummary
AS
BEGIN
    SET NOCOUNT ON;

    -- Sử dụng Common Table Expression (CTE) để tính doanh thu mỗi ngày
    WITH DailyRevenue AS (
        SELECT
            CAST(ngayDatHang AS DATE) AS Ngay,
            SUM(thanhTien) AS DoanhThu
        FROM
            dbo.DonHang
        WHERE
            trangThaiDonHang = 'COMPLETED'
        GROUP BY
            CAST(ngayDatHang AS DATE)
    )
    SELECT
        MAX(DoanhThu) AS DoanhThuCaoNhat,
        MIN(DoanhThu) AS DoanhThuThapNhat
    FROM
        DailyRevenue;
END
GO