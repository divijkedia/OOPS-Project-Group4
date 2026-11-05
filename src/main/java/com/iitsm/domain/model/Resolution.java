package com.iitsm.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.time.LocalDateTime;

/**
 * Value object (Embeddable) holding resolution findings, root cause analysis,
 * remediation steps, and timestamp.
 */
@Embeddable
public class Resolution {

    @Column(name = "resolved_by_id")
    private Long resolvedById;

    @Column(name = "resolution_summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "resolution_root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(name = "resolution_steps", columnDefinition = "TEXT")
    private String steps;

    public Resolution() {
    }

    public Resolution(Long resolvedById, String summary, String rootCause, String steps) {
        this.resolvedById = resolvedById;
        this.summary = summary;
        this.rootCause = rootCause;
        this.steps = steps;
    }

    public Long getResolvedById() {
        return resolvedById;
    }

    public void setResolvedById(Long resolvedById) {
        this.resolvedById = resolvedById;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRootCause() {
        return rootCause;
    }

    public void setRootCause(String rootCause) {
        this.rootCause = rootCause;
    }

    public String getSteps() {
        return steps;
    }

    public void setSteps(String steps) {
        this.steps = steps;
    }
}
