package com.iitsm.intelligence;

import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.model.Incident;

import java.util.List;

/**
 * Intelligent Feature: Automated Incident Escalation Engine.
 * Automates policy-driven escalation of stalled, duplicate-clustered, or SLA-endangered incidents
 * through the 4-tier ITIL escalation hierarchy (Technician -> Team Lead -> System Admin -> IT Manager).
 */
public interface AutoEscalationService {

    /**
     * Determines whether the given incident qualifies for automated operational escalation.
     */
    boolean shouldEscalate(Incident incident);

    /**
     * Evaluates and applies escalation policies across active incidents.
     *
     * @return count of escalated incidents
     */
    int evaluateAndEscalate();

    /**
     * Explicitly escalates an incident to a specified operational tier.
     */
    Incident escalateIncident(Long incidentId, EscalationLevel targetLevel, String reason, Long requestingUserId);

    /**
     * Recommends target escalation priority, operational tier, and rationale.
     */
    List<String> getEscalationRecommendations(Incident incident);
}
