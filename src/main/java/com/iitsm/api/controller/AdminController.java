package com.iitsm.api.controller;

import com.iitsm.api.dto.request.CreateCategoryRequest;
import com.iitsm.api.dto.request.CreateServiceRequest;
import com.iitsm.api.dto.request.CreateSlaPolicyRequest;
import com.iitsm.api.dto.request.SwitchStrategyRequest;
import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.CategoryResponse;
import com.iitsm.api.dto.response.ItServiceResponse;
import com.iitsm.api.dto.response.SlaPolicyResponse;
import com.iitsm.api.dto.response.UserResponse;
import com.iitsm.api.mapper.CatalogMapper;
import com.iitsm.api.mapper.UserMapper;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.SlaPolicy;
import com.iitsm.domain.model.Technician;
import com.iitsm.domain.model.User;
import com.iitsm.domain.strategy.AssignmentStrategy;
import com.iitsm.intelligence.AutoEscalationService;
import com.iitsm.service.AssignmentStrategyManager;
import com.iitsm.service.CategoryService;
import com.iitsm.service.ItServiceService;
import com.iitsm.service.SlaPolicyService;
import com.iitsm.service.TechnicianService;
import com.iitsm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Administrator Management", description = "Administrative operations: user management, catalog config, SLA policies, and assignment strategies")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Transactional
public class AdminController {

    private final UserService userService;
    private final TechnicianService technicianService;
    private final ItServiceService itServiceService;
    private final CategoryService categoryService;
    private final SlaPolicyService slaPolicyService;
    private final AssignmentStrategyManager strategyManager;
    private final UserMapper userMapper;
    private final CatalogMapper catalogMapper;
    private final AutoEscalationService autoEscalationService;

    public AdminController(UserService userService,
                           TechnicianService technicianService,
                           ItServiceService itServiceService,
                           CategoryService categoryService,
                           SlaPolicyService slaPolicyService,
                           AssignmentStrategyManager strategyManager,
                           UserMapper userMapper,
                           CatalogMapper catalogMapper,
                           AutoEscalationService autoEscalationService) {
        this.userService = userService;
        this.technicianService = technicianService;
        this.itServiceService = itServiceService;
        this.categoryService = categoryService;
        this.slaPolicyService = slaPolicyService;
        this.strategyManager = strategyManager;
        this.userMapper = userMapper;
        this.catalogMapper = catalogMapper;
        this.autoEscalationService = autoEscalationService;
    }

    // --- User & Technician Management ---

    @Operation(summary = "List all registered users")
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users.stream().map(userMapper::toResponse).toList()));
    }

    @Operation(summary = "List all technicians with workload metrics")
    @GetMapping("/technicians")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listTechnicians() {
        List<Technician> techs = technicianService.getAllTechnicians();
        return ResponseEntity.ok(ApiResponse.success(techs.stream().map(userMapper::toResponse).toList()));
    }

    @Operation(summary = "Toggle technician availability (on-duty / off-duty) (Admin)")
    @PutMapping({"/technicians/{id}/availability", "/users/{id}/availability"})
    public ResponseEntity<ApiResponse<UserResponse>> setTechnicianAvailability(
            @PathVariable Long id,
            @RequestParam boolean available) {

        Technician updated = technicianService.updateAvailability(id, available);
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(updated), "Technician availability updated"));
    }

    // --- IT Service Catalog CRUD ---

    @Operation(summary = "List all IT Services")
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ItServiceResponse>>> listServices() {
        List<ItService> services = itServiceService.getAllServices();
        return ResponseEntity.ok(ApiResponse.success(services.stream().map(catalogMapper::toResponse).toList()));
    }

    @Operation(summary = "Register a new IT Service")
    @PostMapping("/services")
    public ResponseEntity<ApiResponse<ItServiceResponse>> createService(@Valid @RequestBody CreateServiceRequest req) {
        ItService created = itServiceService.createService(req.name(), req.description(), req.businessCriticality());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(catalogMapper.toResponse(created), "IT Service created"));
    }

    @Operation(summary = "Delete an IT Service")
    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        itServiceService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.message("IT Service deleted successfully"));
    }

    // --- Category Catalog CRUD ---

    @Operation(summary = "List all incident categories")
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> listCategories() {
        List<IncidentCategory> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories.stream().map(catalogMapper::toResponse).toList()));
    }

    @Operation(summary = "Create a new incident category with auto-classification keywords")
    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CreateCategoryRequest req) {
        IncidentCategory created = categoryService.createCategory(req.name(), req.description(), req.keywords());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(catalogMapper.toResponse(created), "Category created"));
    }

    @Operation(summary = "Delete an incident category")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.message("Category deleted successfully"));
    }

    // --- SLA Policies CRUD ---

    @Operation(summary = "List all configured SLA policies")
    @GetMapping("/sla-policies")
    public ResponseEntity<ApiResponse<List<SlaPolicyResponse>>> listSlaPolicies() {
        List<SlaPolicy> policies = slaPolicyService.getAllPolicies();
        return ResponseEntity.ok(ApiResponse.success(policies.stream().map(catalogMapper::toResponse).toList()));
    }

    @Operation(summary = "Create an SLA policy (global or service-specific)")
    @PostMapping("/sla-policies")
    public ResponseEntity<ApiResponse<SlaPolicyResponse>> createSlaPolicy(@Valid @RequestBody CreateSlaPolicyRequest req) {
        ItService service = req.serviceId() != null ? itServiceService.getServiceById(req.serviceId()) : null;
        SlaPolicy created = slaPolicyService.createPolicy(
                req.priority(), service, req.responseTargetMinutes(), req.resolutionTargetMinutes()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(catalogMapper.toResponse(created), "SLA policy configured"));
    }

    @Operation(summary = "Delete an SLA policy")
    @DeleteMapping("/sla-policies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSlaPolicy(@PathVariable Long id) {
        slaPolicyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.message("SLA policy deleted successfully"));
    }

    // --- Assignment Strategy Management ---

    @Operation(summary = "View current active technician assignment strategy and available alternatives")
    @GetMapping("/config/assignment-strategy")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAssignmentStrategyConfig() {
        List<Map<String, String>> available = strategyManager.getAvailableStrategies().stream()
                .map(s -> Map.of("name", s.getName(), "description", s.getDescription()))
                .toList();

        Map<String, Object> config = Map.of(
                "activeStrategy", strategyManager.getActiveStrategyName(),
                "activeDescription", strategyManager.getActiveStrategy().getDescription(),
                "availableStrategies", available
        );

        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @Operation(summary = "Dynamically switch active technician assignment strategy (e.g. SKILL_BASED, LOAD_BASED, ROUND_ROBIN)")
    @PutMapping("/config/assignment-strategy")
    public ResponseEntity<ApiResponse<Map<String, String>>> switchAssignmentStrategy(
            @Valid @RequestBody SwitchStrategyRequest req) {

        strategyManager.setActiveStrategy(req.strategyName());
        AssignmentStrategy active = strategyManager.getActiveStrategy();

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("activeStrategy", active.getName(), "description", active.getDescription()),
                "Active assignment strategy updated successfully"
        ));
    }

    @Operation(summary = "Trigger immediate automated SLA & duplicate escalation sweep across all active incidents")
    @PostMapping("/escalation/run")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerEscalationSweep() {
        int count = autoEscalationService.evaluateAndEscalate();
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("escalatedCount", count),
                count > 0 ? "Escalation sweep completed: " + count + " incidents escalated" : "Escalation sweep completed: No incidents required escalation"
        ));
    }
}
