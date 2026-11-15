package com.iitsm.api.mapper;

import com.iitsm.api.dto.response.UserResponse;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Technician;
import com.iitsm.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        String department = null;
        String phone = null;
        if (user instanceof Employee emp) {
            department = emp.getDepartment();
            phone = emp.getPhone();
        }

        com.iitsm.domain.enums.ExperienceLevel level = null;
        Integer maxWorkload = null;
        Integer activeIncidentCount = null;
        Boolean available = null;
        java.util.Set<String> skills = null;

        if (user instanceof Technician tech) {
            level = tech.getExperienceLevel();
            maxWorkload = tech.getMaxWorkload();
            activeIncidentCount = tech.getActiveIncidentCount();
            available = tech.isAvailable();
            skills = tech.getSkills();
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                department,
                phone,
                level,
                maxWorkload,
                activeIncidentCount,
                available,
                skills
        );
    }
}
