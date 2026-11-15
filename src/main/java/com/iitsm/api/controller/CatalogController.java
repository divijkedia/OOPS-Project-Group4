package com.iitsm.api.controller;

import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.CategoryResponse;
import com.iitsm.api.dto.response.ItServiceResponse;
import com.iitsm.api.mapper.CatalogMapper;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.ItService;
import com.iitsm.service.CategoryService;
import com.iitsm.service.ItServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller exposing general service and category catalog data
 * accessible to all authenticated enterprise roles (Employees, Technicians, Admins).
 */
@Tag(name = "Catalog", description = "Query IT Services and Incident Categories for incident reporting and classification")
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final ItServiceService itServiceService;
    private final CategoryService categoryService;
    private final CatalogMapper catalogMapper;

    public CatalogController(ItServiceService itServiceService,
                             CategoryService categoryService,
                             CatalogMapper catalogMapper) {
        this.itServiceService = itServiceService;
        this.categoryService = categoryService;
        this.catalogMapper = catalogMapper;
    }

    @Operation(summary = "List all active IT services for incident reporting")
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ItServiceResponse>>> listActiveServices() {
        List<ItService> services = itServiceService.getAllServices();
        return ResponseEntity.ok(ApiResponse.success(services.stream().map(catalogMapper::toResponse).toList()));
    }

    @Operation(summary = "List all available incident categories")
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> listCategories() {
        List<IncidentCategory> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories.stream().map(catalogMapper::toResponse).toList()));
    }

    @Operation(summary = "Auto-suggest category based on title and description keywords")
    @GetMapping("/categories/suggest")
    public ResponseEntity<ApiResponse<CategoryResponse>> suggestCategory(@RequestParam String text) {
        return categoryService.suggestCategory(text)
                .map(cat -> ResponseEntity.ok(ApiResponse.success(catalogMapper.toResponse(cat), "Suggested category match found")))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success(null, "No matching category keyword rule found")));
    }
}
