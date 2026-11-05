package com.iitsm.domain.model;

import com.iitsm.domain.enums.Priority;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.Objects;

/**
 * Service Level Agreement policy defining target response and resolution durations
 * based on incident Priority and optional IT Service specialization.
 * A policy with a null service is treated as the global fallback policy for that priority.
 */
@Entity
@Table(name = "sla_policies", uniqueConstraints = {
        @UniqueConstraint(name = "uk_sla_priority_service", columnNames = {"priority", "service_id"})
})
public class SlaPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private Priority priority;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id")
    private ItService itService;

    @Column(name = "response_target_minutes", nullable = false)
    private int responseTargetMinutes;

    @Column(name = "resolution_target_minutes", nullable = false)
    private int resolutionTargetMinutes;

    public SlaPolicy() {
    }

    public SlaPolicy(Priority priority, ItService itService, int responseTargetMinutes, int resolutionTargetMinutes) {
        this.priority = Objects.requireNonNull(priority, "Priority cannot be null");
        this.itService = itService;
        this.responseTargetMinutes = Math.max(1, responseTargetMinutes);
        this.resolutionTargetMinutes = Math.max(1, resolutionTargetMinutes);
    }

    public boolean isGlobal() {
        return itService == null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public ItService getItService() {
        return itService;
    }

    public void setItService(ItService itService) {
        this.itService = itService;
    }

    public int getResponseTargetMinutes() {
        return responseTargetMinutes;
    }

    public void setResponseTargetMinutes(int responseTargetMinutes) {
        this.responseTargetMinutes = Math.max(1, responseTargetMinutes);
    }

    public int getResolutionTargetMinutes() {
        return resolutionTargetMinutes;
    }

    public void setResolutionTargetMinutes(int resolutionTargetMinutes) {
        this.resolutionTargetMinutes = Math.max(1, resolutionTargetMinutes);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SlaPolicy slaPolicy)) return false;
        return Objects.equals(id, slaPolicy.id) ||
                (priority == slaPolicy.priority && Objects.equals(itService, slaPolicy.itService));
    }

    @Override
    public int hashCode() {
        return Objects.hash(priority, itService);
    }

    @Override
    public String toString() {
        return "SlaPolicy{" +
                "id=" + id +
                ", priority=" + priority +
                ", itService=" + (itService != null ? itService.getName() : "GLOBAL") +
                ", responseTargetMinutes=" + responseTargetMinutes +
                ", resolutionTargetMinutes=" + resolutionTargetMinutes +
                '}';
    }
}
