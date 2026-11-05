package com.iitsm.domain.model;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.exception.InvalidStateTransitionException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * Core aggregate root representing an IT service failure, disruption, or incident.
 * Encapsulates the complete lifecycle, associations with reporters, services, and technicians,
 * composite SLA tracking, and resolution details.
 * Demonstrates:
 * - Encapsulation: Status is modified only via domain-specific transition methods with invariant checks.
 * - Composition: SlaTracking, Resolution, and Feedback exist as embedded value objects.
 * - Association: References Employee (reporter), ItService, and Technician.
 */
@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "impact", nullable = false, length = 20)
    private Impact impact;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency", nullable = false, length = 20)
    private Urgency urgency;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_criticality", nullable = false, length = 20)
    private BusinessCriticality businessCriticality;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private Priority priority;

    @Column(name = "priority_score", nullable = false)
    private int priorityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private IncidentStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Employee reporter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private ItService affectedService;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private IncidentCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private Technician assignedTechnician;

    @Column(name = "affected_user_count", nullable = false)
    private int affectedUserCount = 1;

    @Embedded
    private SlaTracking slaTracking = new SlaTracking();

    @Embedded
    private Resolution resolution = new Resolution();

    @Embedded
    private Feedback feedback = new Feedback();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "incident_related",
            joinColumns = @JoinColumn(name = "incident_id"),
            inverseJoinColumns = @JoinColumn(name = "related_incident_id")
    )
    private Set<Incident> relatedIncidents = new HashSet<>();

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<InvestigationNote> notes = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "escalation_level", length = 30)
    private EscalationLevel escalationLevel = EscalationLevel.NONE;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @Column(name = "escalation_reason")
    private String escalationReason;

    @Column(name = "attachment_name")
    private String attachmentName;

    @Column(name = "attachment_type")
    private String attachmentType;

    @Column(name = "attachment_data", columnDefinition = "TEXT")
    private String attachmentData;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Incident() {
    }

    public Incident(String title, String description, Employee reporter, ItService affectedService,
                    Impact impact, Urgency urgency, int affectedUserCount) {
        this.title = Objects.requireNonNull(title, "Title cannot be null").trim();
        this.description = Objects.requireNonNull(description, "Description cannot be null").trim();
        this.reporter = Objects.requireNonNull(reporter, "Reporter cannot be null");
        this.affectedService = Objects.requireNonNull(affectedService, "Affected service cannot be null");
        this.impact = Objects.requireNonNull(impact, "Impact cannot be null");
        this.urgency = Objects.requireNonNull(urgency, "Urgency cannot be null");
        this.businessCriticality = affectedService.getBusinessCriticality();
        this.affectedUserCount = Math.max(1, affectedUserCount);
        this.status = IncidentStatus.NEW;
        this.priority = Priority.P4;
        this.priorityScore = 1;
        this.slaTracking = new SlaTracking();
        this.resolution = new Resolution();
        this.feedback = new Feedback();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // --- Domain Lifecycle Methods ---

    /**
     * Transitions incident to a target state using the State Pattern,
     * validating business lifecycle constraints and throwing InvalidStateTransitionException on violation.
     */
    public void transitionTo(IncidentStatus targetStatus) {
        com.iitsm.domain.state.IncidentState.of(this.status).transition(this, targetStatus);
    }

    /**
     * Associates a category with the incident and transitions status to CLASSIFIED.
     */
    public void classify(IncidentCategory category) {
        this.category = Objects.requireNonNull(category, "Category cannot be null");
        transitionTo(IncidentStatus.CLASSIFIED);
    }

    /**
     * Assigns a technician to the incident, manages technician workload, and transitions to ASSIGNED.
     */
    public void assignTechnician(Technician technician) {
        Objects.requireNonNull(technician, "Technician cannot be null");
        if (this.assignedTechnician != null && this.assignedTechnician.equals(technician)) {
            return;
        }
        transitionTo(IncidentStatus.ASSIGNED);
        technician.incrementWorkload();
        if (this.assignedTechnician != null) {
            this.assignedTechnician.decrementWorkload();
        }
        this.assignedTechnician = technician;
    }

    /**
     * Unassigns the primary support technician completely, decrements technician workload,
     * clears the assigned technician reference, and transitions status back to CLASSIFIED (or NEW if unclassified).
     */
    public void unassignTechnician() {
        if (this.assignedTechnician == null) {
            return;
        }
        if (!this.status.isOpen()) {
            throw new IllegalStateException("Cannot unassign a resolved or closed incident.");
        }
        this.assignedTechnician.decrementWorkload();
        this.assignedTechnician = null;
        transitionTo(this.category != null ? IncidentStatus.CLASSIFIED : IncidentStatus.NEW);
    }

    /**
     * Technician acknowledges the assignment, recording response time on the SLA tracker.
     */
    public void acknowledge() {
        transitionTo(IncidentStatus.ACKNOWLEDGED);
        if (this.slaTracking != null) {
            this.slaTracking.recordResponse(LocalDateTime.now());
        }
    }

    /**
     * Moves the incident into active investigation.
     */
    public void startInvestigation() {
        transitionTo(IncidentStatus.IN_PROGRESS);
    }

    /**
     * Records resolution findings and updates status to RESOLVED.
     */
    public void resolve(Long resolvedById, String summary, String rootCause, String steps) {
        transitionTo(IncidentStatus.RESOLVED);
        this.resolution = new Resolution(resolvedById, summary, rootCause, steps);
        if (this.slaTracking != null) {
            this.slaTracking.recordResolution(LocalDateTime.now());
        }
        if (this.assignedTechnician != null) {
            this.assignedTechnician.decrementWorkload();
        }
    }

    /**
     * Verifies that the resolution is confirmed by user or QA.
     */
    public void verify() {
        transitionTo(IncidentStatus.VERIFIED);
    }

    /**
     * Formally closes the incident.
     */
    public void close() {
        transitionTo(IncidentStatus.CLOSED);
        if (this.slaTracking != null && this.slaTracking.getClosedAt() == null) {
            this.slaTracking.setClosedAt(LocalDateTime.now());
        }
    }

    /**
     * Reopens a previously resolved, verified, or closed incident when the problem recurs.
     */
    public void reopen(String reason) {
        transitionTo(IncidentStatus.REOPENED);
    }

    /**
     * Appends an investigation note to this incident.
     */
    public void addNote(User author, String content) {
        addNote(author, content, null, null, null);
    }

    /**
     * Appends an investigation note with optional file / screenshot attachment.
     */
    public void addNote(User author, String content, String attachmentName, String attachmentType, String attachmentData) {
        InvestigationNote note = new InvestigationNote(this, author, content, attachmentName, attachmentType, attachmentData);
        this.notes.add(note);
    }

    /**
     * Links a duplicate or related incident.
     */
    public void linkRelatedIncident(Incident other) {
        if (other != null && !other.equals(this)) {
            this.relatedIncidents.add(other);
        }
    }

    /**
     * Escalates the incident to a higher operational tier.
     */
    public void escalate(EscalationLevel targetLevel, String reason) {
        this.escalationLevel = targetLevel != null ? targetLevel : EscalationLevel.NONE;
        this.escalatedAt = LocalDateTime.now();
        this.escalationReason = reason;
    }

    public EscalationLevel getEscalationLevel() {
        return escalationLevel != null ? escalationLevel : EscalationLevel.NONE;
    }

    public void setEscalationLevel(EscalationLevel escalationLevel) {
        this.escalationLevel = escalationLevel;
    }

    public LocalDateTime getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(LocalDateTime escalatedAt) {
        this.escalatedAt = escalatedAt;
    }

    public String getEscalationReason() {
        return escalationReason;
    }

    public void setEscalationReason(String escalationReason) {
        this.escalationReason = escalationReason;
    }

    /**
     * Submits feedback if incident is in RESOLVED, VERIFIED, or CLOSED status.
     */
    public void submitFeedback(int rating, String comment) {
        if (this.status != IncidentStatus.RESOLVED &&
                this.status != IncidentStatus.VERIFIED &&
                this.status != IncidentStatus.CLOSED) {
            throw new InvalidStateTransitionException(
                    "Feedback can only be submitted for resolved, verified, or closed incidents");
        }
        this.feedback = new Feedback(rating, comment);
    }

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Impact getImpact() {
        return impact;
    }

    public void setImpact(Impact impact) {
        this.impact = impact;
    }

    public Urgency getUrgency() {
        return urgency;
    }

    public void setUrgency(Urgency urgency) {
        this.urgency = urgency;
    }

    public BusinessCriticality getBusinessCriticality() {
        return businessCriticality;
    }

    public void setBusinessCriticality(BusinessCriticality businessCriticality) {
        this.businessCriticality = businessCriticality;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public int getPriorityScore() {
        return priorityScore;
    }

    public void setPriorityScore(int priorityScore) {
        this.priorityScore = priorityScore;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public Employee getReporter() {
        return reporter;
    }

    public void setReporter(Employee reporter) {
        this.reporter = reporter;
    }

    public ItService getAffectedService() {
        return affectedService;
    }

    public void setAffectedService(ItService affectedService) {
        this.affectedService = affectedService;
    }

    public IncidentCategory getCategory() {
        return category;
    }

    public void setCategory(IncidentCategory category) {
        this.category = category;
    }

    public Technician getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(Technician assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public int getAffectedUserCount() {
        return affectedUserCount;
    }

    public void setAffectedUserCount(int affectedUserCount) {
        this.affectedUserCount = Math.max(1, affectedUserCount);
    }

    public SlaTracking getSlaTracking() {
        return slaTracking;
    }

    public void setSlaTracking(SlaTracking slaTracking) {
        this.slaTracking = slaTracking != null ? slaTracking : new SlaTracking();
    }

    public Resolution getResolution() {
        return resolution;
    }

    public void setResolution(Resolution resolution) {
        this.resolution = resolution != null ? resolution : new Resolution();
    }

    public Feedback getFeedback() {
        return feedback;
    }

    public void setFeedback(Feedback feedback) {
        this.feedback = feedback != null ? feedback : new Feedback();
    }

    public Set<Incident> getRelatedIncidents() {
        return Collections.unmodifiableSet(relatedIncidents);
    }

    public void setRelatedIncidents(Set<Incident> relatedIncidents) {
        this.relatedIncidents = relatedIncidents != null ? new HashSet<>(relatedIncidents) : new HashSet<>();
    }

    public List<InvestigationNote> getNotes() {
        return Collections.unmodifiableList(notes);
    }

    public String getAttachmentName() {
        return attachmentName;
    }

    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }

    public String getAttachmentType() {
        return attachmentType;
    }

    public void setAttachmentType(String attachmentType) {
        this.attachmentType = attachmentType;
    }

    public String getAttachmentData() {
        return attachmentData;
    }

    public void setAttachmentData(String attachmentData) {
        this.attachmentData = attachmentData;
    }

    public boolean hasAttachment() {
        return attachmentData != null && !attachmentData.isBlank();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Incident incident)) return false;
        return Objects.equals(id, incident.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Incident{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", priority=" + priority +
                ", status=" + status +
                '}';
    }
}
