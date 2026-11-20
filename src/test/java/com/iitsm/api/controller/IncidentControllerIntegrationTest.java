package com.iitsm.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iitsm.api.dto.request.CreateIncidentRequest;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.model.Employee;
import com.iitsm.repository.EmployeeRepository;
import com.iitsm.security.SecurityUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Incident Controller HTTP Endpoints")
class IncidentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    @DisplayName("Should create incident, perform auto-classification, compute priority, and assign technician")
    void shouldCreateIncidentEndToEnd() throws Exception {
        Employee employee = employeeRepository.findByUsername("emp_john")
                .orElseThrow();
        SecurityUser securityUser = new SecurityUser(employee);

        CreateIncidentRequest request = new CreateIncidentRequest(
                "Payment checkout fails with database connection timeout",
                "Users cannot complete credit card orders due to postgres query timeout",
                1L, // Payment service
                null, // null category to test keyword auto-classification
                Impact.HIGH,
                Urgency.CRITICAL,
                150
        );

        mockMvc.perform(post("/api/incidents")
                        .with(SecurityMockMvcRequestPostProcessors.user(securityUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.priority").value("P1"))
                .andExpect(jsonPath("$.data.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.data.category.name").value("Database"))
                .andExpect(jsonPath("$.data.assignedTechnician").value(notNullValue()))
                .andExpect(jsonPath("$.data.slaTracking.responseDeadline").isString());
    }

    @Test
    @DisplayName("Should list incidents visible to the authenticated employee")
    void shouldListIncidentsForEmployee() throws Exception {
        Employee employee = employeeRepository.findByUsername("emp_sarah")
                .orElseThrow();
        SecurityUser securityUser = new SecurityUser(employee);

        mockMvc.perform(get("/api/incidents")
                        .with(SecurityMockMvcRequestPostProcessors.user(securityUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should create incident with attachment and add investigation note with attachment")
    void shouldSupportAttachmentsOnIncidentAndNotes() throws Exception {
        Employee employee = employeeRepository.findByUsername("emp_john").orElseThrow();
        SecurityUser securityUser = new SecurityUser(employee);

        String sampleBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        CreateIncidentRequest createReq = new CreateIncidentRequest(
                "UI rendering defect on checkout with screenshot",
                "Application displays blank screen on checkout as shown in screenshot",
                1L,
                null,
                Impact.MEDIUM,
                Urgency.MEDIUM,
                10,
                "screenshot-checkout.png",
                "image/png",
                sampleBase64
        );

        String responseBody = mockMvc.perform(post("/api/incidents")
                        .with(SecurityMockMvcRequestPostProcessors.user(securityUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.attachmentName").value("screenshot-checkout.png"))
                .andExpect(jsonPath("$.data.attachmentType").value("image/png"))
                .andExpect(jsonPath("$.data.attachmentData").value(sampleBase64))
                .andReturn().getResponse().getContentAsString();

        Long incidentId = objectMapper.readTree(responseBody).get("data").get("id").asLong();

        // Add note with follow-up attachment
        com.iitsm.api.dto.request.AddNoteRequest noteReq = new com.iitsm.api.dto.request.AddNoteRequest(
                "Captured network inspector trace showing 500 error",
                "network-trace.png",
                "image/png",
                sampleBase64
        );

        mockMvc.perform(post("/api/incidents/" + incidentId + "/notes")
                        .with(SecurityMockMvcRequestPostProcessors.user(securityUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.notes").isArray())
                .andExpect(jsonPath("$.data.notes[0].attachmentName").value("network-trace.png"))
                .andExpect(jsonPath("$.data.notes[0].attachmentType").value("image/png"))
                .andExpect(jsonPath("$.data.notes[0].attachmentData").value(sampleBase64));
    }
}
