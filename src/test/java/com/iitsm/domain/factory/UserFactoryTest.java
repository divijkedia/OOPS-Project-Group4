package com.iitsm.domain.factory;

import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Role;
import com.iitsm.domain.model.Administrator;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Technician;
import com.iitsm.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Factory Pattern: User Factory")
class UserFactoryTest {

    private UserFactory factory;

    @BeforeEach
    void setUp() {
        factory = new UserFactory();
    }

    @Test
    @DisplayName("Should create Employee with proper role and department")
    void shouldCreateEmployee() {
        User user = factory.createUser(
                Role.EMPLOYEE,
                "john_doe",
                "john@co.local",
                "hashedPass",
                "John Doe",
                "Human Resources",
                "+1-555-0199",
                null,
                null,
                null
        );

        assertInstanceOf(Employee.class, user);
        Employee employee = (Employee) user;
        assertEquals(Role.EMPLOYEE, employee.getRole());
        assertEquals("Human Resources", employee.getDepartment());
        assertEquals("+1-555-0199", employee.getPhone());
        assertTrue(employee.isActive());
    }

    @Test
    @DisplayName("Should create Technician with skills, experience level, and max workload")
    void shouldCreateTechnician() {
        User user = factory.createUser(
                Role.TECHNICIAN,
                "alice_tech",
                "alice@co.local",
                "hashedPass",
                "Alice Smith",
                null,
                null,
                ExperienceLevel.EXPERT,
                8,
                Set.of("CLOUD", "KUBERNETES")
        );

        assertInstanceOf(Technician.class, user);
        Technician tech = (Technician) user;
        assertEquals(Role.TECHNICIAN, tech.getRole());
        assertEquals(ExperienceLevel.EXPERT, tech.getExperienceLevel());
        assertEquals(8, tech.getMaxWorkload());
        assertEquals(0, tech.getActiveIncidentCount());
        assertTrue(tech.hasSkill("CLOUD"));
        assertTrue(tech.hasSkill("KUBERNETES"));
        assertFalse(tech.hasSkill("HARDWARE"));
    }

    @Test
    @DisplayName("Should create Administrator")
    void shouldCreateAdministrator() {
        User user = factory.createUser(
                Role.ADMIN,
                "super_admin",
                "admin@co.local",
                "hashedPass",
                "Super Administrator",
                null,
                null,
                null,
                null,
                null
        );

        assertInstanceOf(Administrator.class, user);
        Administrator admin = (Administrator) user;
        assertEquals(Role.ADMIN, admin.getRole());
    }
}
