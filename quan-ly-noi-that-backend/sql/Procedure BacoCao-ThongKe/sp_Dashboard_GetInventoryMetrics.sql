-- =============================================
-- Description: Lấy các số liệu thống kê về tồn kho.
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetInventoryMetrics
AS
BEGIN
    SET NOCOUNT ON;

    -- Tổng số lượng sản phẩm tồn kho
    DECLARE @TotalStock INT = (
        SELECT COALESCE(SUM(soLuongTon), 0)
        FROM dbo.BienTheSanPham
    );

    -- Số sản phẩm sắp hết hàng (tồn kho <= mức tồn tối thiểu)
    DECLARE @LowStock INT = (
        SELECT COUNT(maBienThe)
        FROM dbo.BienTheSanPham
        WHERE soLuongTon > 0 AND soLuongTon <= mucTonToiThieu
    );

    -- Số sản phẩm đã hết hàng
    DECLARE @OutOfStock INT = (
        SELECT COUNT(maBienThe)
        FROM dbo.BienTheSanPham
        WHERE soLuongTon <= 0
    );

    -- Tổng giá trị hàng tồn kho (dựa trên giá mua)
    DECLARE @StockValue NUMERIC(18, 2) = (
        SELECT COALESCE(SUM(soLuongTon * giaMua), 0)
        FROM dbo.BienTheSanPham
    );

    -- Trả về kết quả
    SELECT
        @TotalStock AS totalStock,
        @LowStock AS lowStock,
        @OutOfStock AS outOfStock,
        @StockValue AS stockValue;
END
GO