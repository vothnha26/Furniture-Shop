-- =============================================
-- Description: Lấy danh sách các sản phẩm cần cảnh báo tồn kho.
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetInventoryAlerts
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sp.ten_san_pham,
        bsp.sku,
        bsp.so_luong_ton AS SoLuongTon,
        bsp.muc_ton_toi_thieu AS MucTonToiThieu,
        CASE
            WHEN bsp.so_luong_ton <= 0 THEN 'Hết hàng'
            ELSE 'Sắp hết hàng'
        END AS TinhTrang
    FROM
        dbo.bien_the_san_pham bsp
    JOIN
        dbo.san_pham sp ON bsp.ma_san_pham = sp.ma_san_pham
    WHERE
        bsp.so_luong_ton <= bsp.muc_ton_toi_thieu -- Điều kiện cảnh báo
    ORDER BY
        SoLuongTon ASC;
END
GO