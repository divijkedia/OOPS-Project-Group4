package com.iitsm.domain.model;

import com.iitsm.domain.enums.AuditAction;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Immutable audit entry recording state changes, lifecycle events, and administrative interventions.
 * Satisfies the Incident Audit Trail requirement (Section 4, Page 8).
 */
@Entity
@Table(name = "audit_records")
public class AuditRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 50)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    private AuditAction action;

    @Column(name = "incident_id")
    private Long incidentId;

    @Column(name = "previous_state", length = 50)
    private String previousState;

    @Column(name = "new_state", length = 50)
    private String newState;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public AuditRecord() {
    }

    public AuditRecord(Long userId, String username, AuditAction action, Long incidentId,
                       String previousState, String newState, String description) {
        this.userId = userId;
        this.username = username;
        this.action = Objects.requireNonNull(action, "AuditAction cannot be null");
        this.incidentId = incidentId;
        this.previousState = previousState;
        this.newState = newState;
        this.description = description;
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public AuditAction getAction() {
        return action;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public String getPreviousState() {
        return previousState;
    }

    public String getNewState() {
        return newState;
    }

    public String getDescription() {
        return description;
    }
}
