package com.iitsm.domain.enums;

/**
 * Categorizes operational activities recorded in the incident audit trail.
 */
public enum AuditAction {
    CREATED,
    CLASSIFIED,
    PRIORITY_SET,
    ASSIGNED,
    ACKNOWLEDGED,
    STATUS_CHANGED,
    NOTE_ADDED,
    RESOLVED,
    VERIFIED,
    CLOSED,
    REOPENED,
    SLA_WARNED,
    SLA_VIOLATED,
    ESCALATED
}
