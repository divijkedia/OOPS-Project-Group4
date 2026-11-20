package com.iitsm.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iitsm.api.dto.request.CreateIncidentRequest;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.model.Administrator;
import com.iitsm.repository.AdministratorRepository;
import com.iitsm.security.SecurityUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Specification-based Incident Search and Filtering")
class IncidentSearchIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private com.iitsm.repository.EmployeeRepository employeeRepository;

    private SecurityUser adminUser;
    private SecurityUser empUser;

    @BeforeEach
    void setUp() throws Exception {
        Administrator admin = administratorRepository.findByUsername("admin")
                .orElseThrow();
        adminUser = new SecurityUser(admin);

        com.iitsm.domain.model.Employee emp = employeeRepository.findByUsername("emp_john")
                .orElseThrow();
        empUser = new SecurityUser(emp);

        // Seed test incidents with distinct characteristics
        CreateIncidentRequest req1 = new CreateIncidentRequest(
                "Kafka event bus connection dropped",
                "Cluster partition causing transaction lag",
                1L, // Payment service
                null,
                Impact.CRITICAL,
                Urgency.CRITICAL,
                150
        );

        CreateIncidentRequest req2 = new CreateIncidentRequest(
                "Office keyboard replacement needed",
                "Employee spilled tea on peripheral keyboard",
                5L, // File storage
                null,
                Impact.LOW,
                Urgency.LOW,
                1
        );

        mockMvc.perform(post("/api/incidents")
                .with(SecurityMockMvcRequestPostProcessors.user(empUser))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req1)));

        mockMvc.perform(post("/api/incidents")
                .with(SecurityMockMvcRequestPostProcessors.user(empUser))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req2)));
    }

    @Test
    @DisplayName("Should filter incidents by text keyword matching title or description")
    void shouldFilterByKeyword() throws Exception {
        mockMvc.perform(get("/api/incidents")
                        .param("search", "Kafka")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].title", containsString("Kafka")));
    }

    @Test
    @DisplayName("Should filter incidents by computed Priority (P1 Critical vs P4 Low)")
    void shouldFilterByPriority() throws Exception {
        mockMvc.perform(get("/api/incidents")
                        .param("priority", "P1")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[*].priority", everyItem(is("P1"))));
    }

    @Test
    @DisplayName("Should filter incidents by IT service ID")
    void shouldFilterByService() throws Exception {
        mockMvc.perform(get("/api/incidents")
                        .param("serviceId", "1")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Should respect pagination and sort order")
    void shouldPaginateAndSortIncidents() throws Exception {
        mockMvc.perform(get("/api/incidents")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "createdAt,desc")
                        .with(SecurityMockMvcRequestPostProcessors.user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
}
