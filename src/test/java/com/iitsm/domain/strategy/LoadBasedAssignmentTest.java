package com.iitsm.domain.strategy;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.Technician;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Strategy Pattern: Load-Based Assignment")
class LoadBasedAssignmentTest {

    private LoadBasedAssignment strategy;
    private Incident incident;

    @BeforeEach
    void setUp() {
        strategy = new LoadBasedAssignment();
        Employee emp = new Employee("emp", "e@co.local", "hash", "Emp", "Sales", "123");
        ItService svc = new ItService("CRM", "Salesforce", BusinessCriticality.MEDIUM);
        incident = new Incident("CRM sync error", "Records failing to sync", emp, svc, Impact.MEDIUM, Urgency.MEDIUM, 5);
    }

    @Test
    @DisplayName("Should assign the technician with the least active incident count")
    void shouldAssignLeastBusyTechnician() {
        Technician tech3 = new Technician("t3", "t3@co.local", "hash", "Tech 3", ExperienceLevel.SENIOR, 5);
        tech3.setActiveIncidentCount(3);

        Technician tech1 = new Technician("t1", "t1@co.local", "hash", "Tech 1", ExperienceLevel.MID, 5);
        tech1.setActiveIncidentCount(1);

        Technician tech4 = new Technician("t4", "t4@co.local", "hash", "Tech 4", ExperienceLevel.EXPERT, 5);
        tech4.setActiveIncidentCount(4);

        List<Technician> pool = List.of(tech3, tech1, tech4);

        Optional<Technician> assigned = strategy.assign(incident, pool);

        assertTrue(assigned.isPresent());
        assertEquals("t1", assigned.get().getUsername(), "Should select tech with lowest active count (1)");
    }

    @Test
    @DisplayName("Should break workload tie using technician experience level")
    void shouldBreakTiesWithExperienceLevel() {
        Technician junior = new Technician("junior", "j@co.local", "hash", "Junior", ExperienceLevel.JUNIOR, 5);
        junior.setActiveIncidentCount(2);

        Technician senior = new Technician("senior", "s@co.local", "hash", "Senior", ExperienceLevel.SENIOR, 5);
        senior.setActiveIncidentCount(2);

        List<Technician> pool = List.of(junior, senior);

        Optional<Technician> assigned = strategy.assign(incident, pool);

        assertTrue(assigned.isPresent());
        assertEquals("senior", assigned.get().getUsername(), "Should pick Senior when active load is equal");
    }

    @Test
    @DisplayName("Should return empty when all technicians are at maximum capacity")
    void shouldReturnEmptyWhenAllAtMaxWorkload() {
        Technician t1 = new Technician("t1", "t1@co.local", "hash", "T1", ExperienceLevel.MID, 2);
        t1.incrementWorkload();
        t1.incrementWorkload(); // 2/2

        Technician t2 = new Technician("t2", "t2@co.local", "hash", "T2", ExperienceLevel.SENIOR, 1);
        t2.incrementWorkload(); // 1/1

        List<Technician> pool = List.of(t1, t2);

        Optional<Technician> assigned = strategy.assign(incident, pool);

        assertTrue(assigned.isEmpty(), "Cannot assign when all candidates are at capacity");
    }
}
