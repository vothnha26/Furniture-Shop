package com.noithat.qlnt.backend.dto.common;

import java.util.List;

/**
 * Response DTO for DanhMuc returned by REST API.
 */
public record DanhMucResponse(Integer maDanhMuc, String tenDanhMuc, String moTa, Integer parentId, List<Integer> childrenIds, Long soLuongSanPham) {}
