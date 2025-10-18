package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.service.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ColumnMapRowMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements IDashboardService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private List<Map<String, Object>> runProcedure(String procName) {
        String sql = "EXEC " + procName;
        return jdbcTemplate.query(sql, new ColumnMapRowMapper());
    }

    @Override
    public List<Map<String, Object>> getOverviewMetrics() {
        return runProcedure("sp_Dashboard_GetOverviewMetrics");
    }

    @Override
    public List<Map<String, Object>> getRevenueTrend() {
        return runProcedure("sp_Dashboard_GetRevenueTrend");
    }

    @Override
    public List<Map<String, Object>> getSalesByProduct() {
        return runProcedure("sp_Dashboard_GetSalesByProduct");
    }

    @Override
    public List<Map<String, Object>> getCustomerMetrics() {
        return runProcedure("sp_Dashboard_GetCustomerMetrics");
    }

    @Override
    public List<Map<String, Object>> getInventoryMetrics() {
        return runProcedure("sp_Dashboard_GetInventoryMetrics");
    }

    @Override
    public List<Map<String, Object>> getInventoryAlerts() {
        return runProcedure("sp_Dashboard_GetInventoryAlerts");
    }

    @Override
    public List<Map<String, Object>> getRevenueSummary() {
        return runProcedure("sp_Dashboard_GetRevenueSummary");
    }

    @Override
    public List<Map<String, Object>> getSalesMetrics() {
        return runProcedure("sp_Dashboard_GetSalesMetrics");
    }

    @Override
    public List<Map<String, Object>> getVipCustomerAnalysis() {
        return runProcedure("sp_Dashboard_GetVipCustomerAnalysis");
    }
}
