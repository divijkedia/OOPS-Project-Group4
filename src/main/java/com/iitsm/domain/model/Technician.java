package com.iitsm.domain.model;

import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Role;
import com.iitsm.domain.exception.WorkloadExceededException;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Technical support engineer responsible for investigating, mitigating, and resolving incidents.
 * Demonstrates:
 * - Inheritance (specialization of User)
 * - Aggregation (owns a collection of technical skills that can exist independently)
 * - Encapsulation (strict state invariants on active incident capacity and workload transitions)
 */
@Entity
@Table(name = "technicians")
@PrimaryKeyJoinColumn(name = "user_id")
public class Technician extends User {

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", nullable = false, length = 20)
    private ExperienceLevel experienceLevel;

    @Column(name = "max_workload", nullable = false)
    private int maxWorkload = 5;

    @Column(name = "available", nullable = false)
    private boolean available = true;

    @Column(name = "active_incident_count", nullable = false)
    private int activeIncidentCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "technician_skills", joinColumns = @JoinColumn(name = "technician_id"))
    @Column(name = "skill", nullable = false, length = 50)
    private Set<String> skills = new HashSet<>();

    public Technician() {
        super();
    }

    public Technician(String username, String email, String passwordHash, String fullName,
                      ExperienceLevel experienceLevel, int maxWorkload) {
        super(username, email, passwordHash, fullName, Role.TECHNICIAN);
        this.experienceLevel = Objects.requireNonNull(experienceLevel, "ExperienceLevel cannot be null");
        this.maxWorkload = Math.max(1, maxWorkload);
        this.available = true;
        this.activeIncidentCount = 0;
    }

    /**
     * Business rule: Checks whether technician has available capacity and is on duty.
     */
    public boolean canAcceptIncident() {
        return available && activeIncidentCount < maxWorkload;
    }

    /**
     * Atomically increases active workload when an incident is assigned, enforcing max capacity invariant.
     */
    public void incrementWorkload() {
        if (activeIncidentCount >= maxWorkload) {
            throw new WorkloadExceededException(getId(), activeIncidentCount, maxWorkload);
        }
        this.activeIncidentCount++;
    }

    /**
     * Atomically decrements active workload when an incident is resolved, closed, or reassigned.
     */
    public void decrementWorkload() {
        if (this.activeIncidentCount > 0) {
            this.activeIncidentCount--;
        }
    }

    /**
     * Checks if technician possesses competence in a specific incident category (case-insensitive).
     */
    public boolean hasSkill(String skillName) {
        if (skillName == null) return false;
        return skills.stream().anyMatch(s -> s.equalsIgnoreCase(skillName.trim()));
    }

    public void addSkill(String skill) {
        if (skill != null && !skill.trim().isEmpty()) {
            this.skills.add(skill.trim().toUpperCase());
        }
    }

    public void removeSkill(String skill) {
        if (skill != null) {
            this.skills.remove(skill.trim().toUpperCase());
        }
    }

    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(ExperienceLevel experienceLevel) {
        this.experienceLevel = Objects.requireNonNull(experienceLevel);
    }

    public int getMaxWorkload() {
        return maxWorkload;
    }

    public void setMaxWorkload(int maxWorkload) {
        this.maxWorkload = Math.max(1, maxWorkload);
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getActiveIncidentCount() {
        return activeIncidentCount;
    }

    public void setActiveIncidentCount(int activeIncidentCount) {
        this.activeIncidentCount = Math.max(0, activeIncidentCount);
    }

    public Set<String> getSkills() {
        return Collections.unmodifiableSet(skills);
    }

    public void setSkills(Set<String> skills) {
        this.skills = skills != null ? new HashSet<>(skills) : new HashSet<>();
    }
}
