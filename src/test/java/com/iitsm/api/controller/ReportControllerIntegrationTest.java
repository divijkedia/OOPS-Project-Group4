package com.iitsm.api.controller;

import com.iitsm.domain.model.Administrator;
import com.iitsm.domain.model.Employee;
import com.iitsm.repository.AdministratorRepository;
import com.iitsm.repository.EmployeeRepository;
import com.iitsm.security.SecurityUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Management Reports Endpoints")
class ReportControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    @DisplayName("Should return Incident Overview report for authenticated Administrator")
    void shouldGetOverviewReportAsAdmin() throws Exception {
        Administrator admin = administratorRepository.findByUsername("admin").orElseThrow();
        SecurityUser user = new SecurityUser(admin);

        mockMvc.perform(get("/api/reports/overview")
                        .with(SecurityMockMvcRequestPostProcessors.user(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalIncidents").isNumber())
                .andExpect(jsonPath("$.data.slaComplianceRatePercent").isNumber())
                .andExpect(jsonPath("$.data.countByPriority").isMap());
    }

    @Test
    @DisplayName("Should return Technician Workload report for Administrator")
    void shouldGetTechnicianReportAsAdmin() throws Exception {
        Administrator admin = administratorRepository.findByUsername("admin").orElseThrow();
        SecurityUser user = new SecurityUser(admin);

        mockMvc.perform(get("/api/reports/technicians")
                        .with(SecurityMockMvcRequestPostProcessors.user(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].technicianId").isNumber())
                .andExpect(jsonPath("$.data[0].fullName").isString());
    }

    @Test
    @DisplayName("Should return Service Analysis report for Administrator")
    void shouldGetServiceReportAsAdmin() throws Exception {
        Administrator admin = administratorRepository.findByUsername("admin").orElseThrow();
        SecurityUser user = new SecurityUser(admin);

        mockMvc.perform(get("/api/reports/services")
                        .with(SecurityMockMvcRequestPostProcessors.user(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].serviceName").isString());
    }

    @Test
    @DisplayName("Should reject access to technician workload report with 403 Forbidden for Employee")
    void shouldRejectEmployeeForTechnicianReport() throws Exception {
        Employee emp = employeeRepository.findByUsername("emp_john").orElseThrow();
        SecurityUser user = new SecurityUser(emp);

        mockMvc.perform(get("/api/reports/technicians")
                        .with(SecurityMockMvcRequestPostProcessors.user(user)))
                .andExpect(status().isForbidden());
    }
}
