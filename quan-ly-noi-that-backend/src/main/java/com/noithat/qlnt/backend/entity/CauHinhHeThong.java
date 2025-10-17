package com.noithat.qlnt.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cau_hinh_he_thong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CauHinhHeThong {
    @Id
    @Column(name = "config_key", length = 100)
    private String configKey;

    @Column(name = "config_value", length = 4000)
    private String configValue;

    @Column(name = "mo_ta", length = 1000)
    private String moTa;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}
