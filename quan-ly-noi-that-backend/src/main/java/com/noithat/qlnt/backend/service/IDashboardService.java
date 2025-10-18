package com.noithat.qlnt.backend.service;

import java.util.List;
import java.util.Map;

public interface IDashboardService {
    List<Map<String, Object>> getOverviewMetrics();
    List<Map<String, Object>> getRevenueTrend();
    List<Map<String, Object>> getSalesByProduct();
    List<Map<String, Object>> getCustomerMetrics();
    List<Map<String, Object>> getInventoryMetrics();
    List<Map<String, Object>> getInventoryAlerts();
    List<Map<String, Object>> getRevenueSummary();
    List<Map<String, Object>> getSalesMetrics();
    List<Map<String, Object>> getVipCustomerAnalysis();
}
