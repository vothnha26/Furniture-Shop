package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CanhBaoTonKho")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CanhBaoTonKho {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer maCanhBao;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MaBienThe", nullable = false)
	private BienTheSanPham bienTheSanPham;

	@Column(name = "MucCanhBao")
	private Integer mucCanhBao;

	@Column(name = "GhiChu", columnDefinition = "NVARCHAR(255)")
	private String ghiChu;
}
