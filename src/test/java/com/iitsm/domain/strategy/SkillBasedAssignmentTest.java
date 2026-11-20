package com.iitsm.domain.strategy;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.Technician;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Strategy Pattern: Skill-Based Assignment")
class SkillBasedAssignmentTest {

    private SkillBasedAssignment strategy;
    private Incident incident;
    private IncidentCategory databaseCategory;

    @BeforeEach
    void setUp() {
        strategy = new SkillBasedAssignment();

        Employee emp = new Employee("john", "j@co.local", "hash", "John", "Fin", "123");
        ItService svc = new ItService("DB", "Main DB", BusinessCriticality.HIGH);
        databaseCategory = new IncidentCategory("Database", "Database queries and storage", "sql,db");

        incident = new Incident("Slow queries", "DB lockups", emp, svc, Impact.HIGH, Urgency.HIGH, 10);
        incident.setCategory(databaseCategory);
    }

    @Test
    @DisplayName("Should assign technician with matching skill, prioritizing highest experience level")
    void shouldAssignTechnicianWithMatchingSkillAndSeniority() {
        Technician juniorDbTech = new Technician("junior", "j@co.local", "hash", "Junior Tech", ExperienceLevel.JUNIOR, 5);
        juniorDbTech.addSkill("DATABASE");

        Technician seniorDbTech = new Technician("senior", "s@co.local", "hash", "Senior Tech", ExperienceLevel.SENIOR, 5);
        seniorDbTech.addSkill("DATABASE");

        Technician networkTech = new Technician("net", "n@co.local", "hash", "Network Tech", ExperienceLevel.EXPERT, 5);
        networkTech.addSkill("NETWORK");

        List<Technician> pool = List.of(juniorDbTech, seniorDbTech, networkTech);

        Optional<Technician> assigned = strategy.assign(incident, pool);

        assertTrue(assigned.isPresent());
        assertEquals("senior", assigned.get().getUsername(), "Should pick Senior over Junior when both have DATABASE skill");
    }

    @Test
    @DisplayName("Should return empty when no available technician possesses the required skill")
    void shouldReturnEmptyWhenNoSkillMatch() {
        Technician hardwareTech = new Technician("hw", "h@co.local", "hash", "Hardware Tech", ExperienceLevel.SENIOR, 5);
        hardwareTech.addSkill("HARDWARE");

        List<Technician> pool = List.of(hardwareTech);

        Optional<Technician> assigned = strategy.assign(incident, pool);

        assertTrue(assigned.isEmpty());
    }

    @Test
    @DisplayName("Should skip technician who has the skill but is unavailable or has reached max workload")
    void shouldSkipUnavailableOrFullTechnicians() {
        Technician busyDbTech = new Technician("busy", "b@co.local", "hash", "Busy Tech", ExperienceLevel.EXPERT, 2);
        busyDbTech.addSkill("DATABASE");
        busyDbTech.incrementWorkload();
        busyDbTech.incrementWorkload(); // At max (2/2)

        Technician juniorFreeTech = new Technician("free", "f@co.local", "hash", "Free Tech", ExperienceLevel.JUNIOR, 5);
        juniorFreeTech.addSkill("DATABASE");

        List<Technician> pool = List.of(busyDbTech, juniorFreeTech);

        Optional<Technician> assigned = strategy.assign(incident, pool);

        assertTrue(assigned.isPresent());
        assertEquals("free", assigned.get().getUsername(), "Should bypass overloaded expert and assign to available junior");
    }
}
