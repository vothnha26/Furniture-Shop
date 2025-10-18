-- =============================================
-- Description: Lấy danh sách các sản phẩm bán chạy nhất.
-- Parameters:
--   @TopN: Số lượng sản phẩm top đầu cần lấy (ví dụ: 5, 10).
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetSalesByProduct
    @TopN INT = 5 -- Mặc định lấy top 5
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@TopN)
        sp.ten_san_pham,
        bsp.sku,
        SUM(ctdh.so_luong) AS TongSoLuongBan,
        SUM(ctdh.don_gia_thuc_te * ctdh.so_luong) AS TongDoanhThu
    FROM
        dbo.chi_tiet_don_hang ctdh
    JOIN
        dbo.bien_the_san_pham bsp ON ctdh.bien_the_ma_bien_the = bsp.ma_bien_the
    JOIN
        dbo.san_pham sp ON bsp.ma_san_pham = sp.ma_san_pham
    JOIN
        dbo.don_hang dh ON ctdh.don_hang_ma_don_hang = dh.ma_don_hang
    WHERE
        dh.trangThaiDonHang = 'COMPLETED'
    GROUP BY
        sp.ten_san_pham, bsp.sku
    ORDER BY
        TongDoanhThu DESC; -- Sắp xếp theo doanh thu giảm dần
END
GO