package com.iitsm.domain.model;

import com.iitsm.domain.enums.SlaStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Value object (Embeddable) encapsulating Service Level Agreement (SLA) deadlines,
 * response/resolution timestamps, breach tracking, and health status.
 * Demonstrates Composition as it has no independent lifecycle apart from its enclosing Incident.
 */
@Embeddable
public class SlaTracking {

    @Column(name = "response_target_minutes")
    private Integer responseTargetMinutes;

    @Column(name = "resolution_target_minutes")
    private Integer resolutionTargetMinutes;

    @Column(name = "response_deadline")
    private LocalDateTime responseDeadline;

    @Column(name = "resolution_deadline")
    private LocalDateTime resolutionDeadline;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "response_breached", nullable = false)
    private boolean responseBreached = false;

    @Column(name = "resolution_breached", nullable = false)
    private boolean resolutionBreached = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "sla_status", nullable = false, length = 20)
    private SlaStatus slaStatus = SlaStatus.ON_TRACK;

    public SlaTracking() {
    }

    public SlaTracking(Integer responseTargetMinutes,
                       Integer resolutionTargetMinutes,
                       LocalDateTime responseDeadline,
                       LocalDateTime resolutionDeadline) {
        this.responseTargetMinutes = responseTargetMinutes;
        this.resolutionTargetMinutes = resolutionTargetMinutes;
        this.responseDeadline = responseDeadline;
        this.resolutionDeadline = resolutionDeadline;
        this.slaStatus = SlaStatus.ON_TRACK;
    }

    /**
     * Marks initial response (e.g. technician acknowledgement) and validates against response deadline.
     */
    public void recordResponse(LocalDateTime responseTime) {
        if (this.respondedAt == null) {
            this.respondedAt = responseTime != null ? responseTime : LocalDateTime.now();
            if (responseDeadline != null && this.respondedAt.isAfter(responseDeadline)) {
                this.responseBreached = true;
                this.slaStatus = SlaStatus.VIOLATED;
            }
        }
    }

    /**
     * Marks incident resolution and validates against resolution deadline.
     */
    public void recordResolution(LocalDateTime resolutionTime) {
        this.resolvedAt = resolutionTime != null ? resolutionTime : LocalDateTime.now();
        if (resolutionDeadline != null && this.resolvedAt.isAfter(resolutionDeadline)) {
            this.resolutionBreached = true;
            this.slaStatus = SlaStatus.VIOLATED;
        }
    }

    /**
     * Evaluates current timestamp against SLA deadlines to update approaching or breached states.
     * Warning threshold: 80% of window elapsed.
     */
    public boolean evaluateCompliance(LocalDateTime now, LocalDateTime createdAt) {
        if (isAnyBreached()) {
            this.slaStatus = SlaStatus.VIOLATED;
            return false;
        }

        // Check if resolution deadline is exceeded
        if (resolvedAt == null && resolutionDeadline != null && now.isAfter(resolutionDeadline)) {
            this.resolutionBreached = true;
            this.slaStatus = SlaStatus.VIOLATED;
            return true;
        }

        // Check if response deadline is exceeded
        if (respondedAt == null && responseDeadline != null && now.isAfter(responseDeadline)) {
            this.responseBreached = true;
            this.slaStatus = SlaStatus.VIOLATED;
            return true;
        }

        // Check if approaching resolution deadline (80% elapsed)
        if (resolvedAt == null && resolutionDeadline != null && createdAt != null) {
            Duration totalWindow = Duration.between(createdAt, resolutionDeadline);
            Duration elapsed = Duration.between(createdAt, now);
            if (!totalWindow.isZero() && !totalWindow.isNegative()) {
                double ratio = (double) elapsed.toMillis() / totalWindow.toMillis();
                if (ratio >= 0.80) {
                    this.slaStatus = SlaStatus.APPROACHING;
                    return true;
                }
            }
        }

        return false;
    }

    public boolean isAnyBreached() {
        return responseBreached || resolutionBreached;
    }

    // Getters and Setters with encapsulation
    public Integer getResponseTargetMinutes() {
        return responseTargetMinutes;
    }

    public void setResponseTargetMinutes(Integer responseTargetMinutes) {
        this.responseTargetMinutes = responseTargetMinutes;
    }

    public Integer getResolutionTargetMinutes() {
        return resolutionTargetMinutes;
    }

    public void setResolutionTargetMinutes(Integer resolutionTargetMinutes) {
        this.resolutionTargetMinutes = resolutionTargetMinutes;
    }

    public LocalDateTime getResponseDeadline() {
        return responseDeadline;
    }

    public void setResponseDeadline(LocalDateTime responseDeadline) {
        this.responseDeadline = responseDeadline;
    }

    public LocalDateTime getResolutionDeadline() {
        return resolutionDeadline;
    }

    public void setResolutionDeadline(LocalDateTime resolutionDeadline) {
        this.resolutionDeadline = resolutionDeadline;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public boolean isResponseBreached() {
        return responseBreached;
    }

    public boolean isResolutionBreached() {
        return resolutionBreached;
    }

    public SlaStatus getSlaStatus() {
        return slaStatus;
    }

    public void setSlaStatus(SlaStatus slaStatus) {
        this.slaStatus = Objects.requireNonNull(slaStatus, "SlaStatus cannot be null");
    }
}
