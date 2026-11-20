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

@DisplayName("Strategy Pattern: Round-Robin Assignment")
class RoundRobinAssignmentTest {

    private RoundRobinAssignment strategy;
    private Incident incident;

    @BeforeEach
    void setUp() {
        strategy = new RoundRobinAssignment();
        strategy.resetCounter();

        Employee emp = new Employee("emp", "e@co.local", "hash", "Emp", "Sales", "123");
        ItService svc = new ItService("Email", "Exchange", BusinessCriticality.HIGH);
        incident = new Incident("Email down", "Outage", emp, svc, Impact.HIGH, Urgency.HIGH, 50);
    }

    @Test
    @DisplayName("Should distribute successive assignments cyclically across available technicians")
    void shouldDistributeCyclically() {
        Technician t1 = new Technician("t1", "t1@co.local", "hash", "T1", ExperienceLevel.MID, 5);
        Technician t2 = new Technician("t2", "t2@co.local", "hash", "T2", ExperienceLevel.SENIOR, 5);
        Technician t3 = new Technician("t3", "t3@co.local", "hash", "T3", ExperienceLevel.EXPERT, 5);

        List<Technician> pool = List.of(t1, t2, t3);

        Optional<Technician> first = strategy.assign(incident, pool);
        Optional<Technician> second = strategy.assign(incident, pool);
        Optional<Technician> third = strategy.assign(incident, pool);
        Optional<Technician> fourth = strategy.assign(incident, pool);

        assertTrue(first.isPresent());
        assertTrue(second.isPresent());
        assertTrue(third.isPresent());
        assertTrue(fourth.isPresent());

        assertEquals("t1", first.get().getUsername());
        assertEquals("t2", second.get().getUsername());
        assertEquals("t3", third.get().getUsername());
        assertEquals("t1", fourth.get().getUsername(), "Should wrap around to first technician");
    }
}
