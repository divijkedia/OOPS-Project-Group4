package com.iitsm.domain.factory;

import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Role;
import com.iitsm.domain.model.Administrator;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Technician;
import com.iitsm.domain.model.User;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;

/**
 * Factory Pattern: Factory for creating polymorphic User hierarchy instances
 * (Employee, Technician, Administrator) with role-specific defaults and invariant validations.
 */
@Component
public class UserFactory {

    /**
     * Creates an Employee instance.
     */
    public Employee createEmployee(String username, String email, String passwordHash,
                                  String fullName, String department, String phone) {
        return new Employee(username, email, passwordHash, fullName, department, phone);
    }

    /**
     * Creates a Technician instance with skills, experience tier, and maximum workload.
     */
    public Technician createTechnician(String username, String email, String passwordHash,
                                      String fullName, ExperienceLevel experienceLevel,
                                      int maxWorkload, Set<String> skills) {
        Technician tech = new Technician(username, email, passwordHash, fullName, experienceLevel, maxWorkload);
        if (skills != null) {
            skills.forEach(tech::addSkill);
        }
        return tech;
    }

    /**
     * Creates a System Administrator instance.
     */
    public Administrator createAdministrator(String username, String email,
                                             String passwordHash, String fullName) {
        return new Administrator(username, email, passwordHash, fullName);
    }

    /**
     * Polymorphic creation based on Role enum.
     */
    public User createUser(Role role, String username, String email, String passwordHash,
                           String fullName, String department, String phone,
                           ExperienceLevel experienceLevel, Integer maxWorkload, Set<String> skills) {
        Objects.requireNonNull(role, "Role cannot be null");
        return switch (role) {
            case EMPLOYEE -> createEmployee(username, email, passwordHash, fullName, department, phone);
            case TECHNICIAN -> createTechnician(username, email, passwordHash, fullName,
                    experienceLevel != null ? experienceLevel : ExperienceLevel.MID,
                    maxWorkload != null ? maxWorkload : 5, skills);
            case ADMIN -> createAdministrator(username, email, passwordHash, fullName);
        };
    }
}
