USE [qlnt_db]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetApplicableVouchers_ForCheckout]    Script Date: 10/17/2025 1:43:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Gemini AI
-- Create date: 17-10-2025
-- Description: Lấy danh sách các voucher hợp lệ cho khách hàng tại thời điểm checkout,
--              dựa trên hạng thành viên VÀ tổng giá trị đơn hàng.
-- Parameters:
--   @ma_khach_hang   - ID của khách hàng cần kiểm tra.
--   @tong_tien_don_hang - Tổng giá trị của giỏ hàng hiện tại.
-- =============================================
ALTER PROCEDURE [dbo].[sp_GetApplicableVouchers_ForCheckout]
    @ma_khach_hang INT,
    @tong_tien_don_hang NUMERIC(18, 2)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ma_hang_thanh_vien INT;

    -- Lấy mã hạng thành viên từ mã khách hàng
    SELECT @ma_hang_thanh_vien = ma_hang_thanh_vien
    FROM dbo.khach_hang
    WHERE ma_khach_hang = @ma_khach_hang;

    IF @ma_hang_thanh_vien IS NULL
    BEGIN
        -- Trả về một tập kết quả trống nếu không tìm thấy khách hàng
        SELECT
            ma_voucher = CAST(NULL AS INT),
            ma_code = CAST(NULL AS VARCHAR(255)),
            ten_voucher = CAST(NULL AS VARCHAR(255)),
            mo_ta = CAST(NULL AS VARCHAR(255)),
            loai_giam_gia = CAST(NULL AS VARCHAR(20)),
            gia_tri_giam = CAST(NULL AS NUMERIC(18, 2)),
            gia_tri_don_hang_toi_thieu = CAST(NULL AS NUMERIC(18, 2)),
            gia_tri_giam_toi_da = CAST(NULL AS NUMERIC(18, 2)),
            ngay_bat_dau = CAST(NULL AS DATETIME2),
            ngay_ket_thuc = CAST(NULL AS DATETIME2)
        WHERE 1 = 0;
        RETURN;
    END

    -- Lấy danh sách voucher công khai (dành cho mọi người)
    SELECT
        v.ma_voucher,
        v.ma_code,
        v.ten_voucher,
        v.mo_ta,
        v.loai_giam_gia,
        v.gia_tri_giam,
        v.gia_tri_don_hang_toi_thieu,
        v.gia_tri_giam_toi_da,
        v.ngay_bat_dau,
        v.ngay_ket_thuc
    FROM
        dbo.voucher v
    WHERE
        v.ap_dung_cho_moi_nguoi = 1
        AND v.trang_thai = 'DANG_HOAT_DONG'
        AND GETDATE() BETWEEN v.ngay_bat_dau AND v.ngay_ket_thuc
        AND v.so_luong_da_su_dung < v.so_luong_toi_da
        -- THÊM ĐIỀU KIỆN KIỂM TRA GIÁ TRỊ ĐƠN HÀNG
        AND v.gia_tri_don_hang_toi_thieu <= @tong_tien_don_hang

    UNION

    -- Lấy danh sách voucher dành riêng cho hạng thành viên của khách hàng
    SELECT
        v.ma_voucher,
        v.ma_code,
        v.ten_voucher,
        v.mo_ta,
        v.loai_giam_gia,
        v.gia_tri_giam,
        v.gia_tri_don_hang_toi_thieu,
        v.gia_tri_giam_toi_da,
        v.ngay_bat_dau,
        v.ngay_ket_thuc
    FROM
        dbo.voucher v
    INNER JOIN
        dbo.voucher_hang_thanh_vien vhtv ON v.ma_voucher = vhtv.voucher_ma_voucher
    WHERE
        vhtv.hang_thanh_vien_ma_hang_thanh_vien = @ma_hang_thanh_vien
        AND v.trang_thai = 'DANG_HOAT_DONG'
        AND GETDATE() BETWEEN v.ngay_bat_dau AND v.ngay_ket_thuc
        AND v.so_luong_da_su_dung < v.so_luong_toi_da
        -- THÊM ĐIỀU KIỆN KIỂM TRA GIÁ TRỊ ĐƠN HÀNG
        AND v.gia_tri_don_hang_toi_thieu <= @tong_tien_don_hang;

END
