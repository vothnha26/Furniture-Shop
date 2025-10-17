package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.service.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    @Autowired
    private IDashboardService dashboardService;

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> customersReport() {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<Map<String, Object>> rows = dashboardService.getCustomerMetrics();
            Map<String, Object> data = new HashMap<>();
            data.put("rows", rows);
            data.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            resp.put("success", true);
            resp.put("data", data);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> salesReport() {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<Map<String, Object>> rows = dashboardService.getRevenueSummary();
            Map<String, Object> data = new HashMap<>();
            data.put("rows", rows);
            data.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            resp.put("success", true);
            resp.put("data", data);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> productsReport() {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<Map<String, Object>> rows = dashboardService.getSalesByProduct();
            Map<String, Object> data = new HashMap<>();
            data.put("rows", rows);
            data.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            resp.put("success", true);
            resp.put("data", data);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> inventoryReport() {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<Map<String, Object>> rows = dashboardService.getInventoryMetrics();
            Map<String, Object> data = new HashMap<>();
            data.put("rows", rows);
            data.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            resp.put("success", true);
            resp.put("data", data);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }
}
