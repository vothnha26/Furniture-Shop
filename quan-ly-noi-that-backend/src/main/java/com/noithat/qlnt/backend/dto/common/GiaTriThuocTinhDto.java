package com.noithat.qlnt.backend.dto.common;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GiaTriThuocTinhDto(
	@JsonProperty("giaTri")
	@JsonAlias({"giaTri", "gia_tri", "value", "name"})
	String giaTri
) {}