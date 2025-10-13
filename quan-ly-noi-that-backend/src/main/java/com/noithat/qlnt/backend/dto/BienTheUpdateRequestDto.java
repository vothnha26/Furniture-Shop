package com.noithat.qlnt.backend.dto;

import java.math.BigDecimal;

public record BienTheUpdateRequestDto(
    String sku,
    BigDecimal giaBan,
    Integer soLuongTon
) {}