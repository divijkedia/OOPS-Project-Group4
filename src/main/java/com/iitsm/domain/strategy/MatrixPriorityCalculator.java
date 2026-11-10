package com.iitsm.domain.strategy;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Urgency;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Strategy Pattern Implementation: ITIL Classical Impact × Urgency Matrix Calculator.
 *
 * Implements the standard ITIL 4×4 lookup matrix:
 *              Urgency:  CRITICAL    HIGH     MEDIUM     LOW
 * Impact:
 * CRITICAL                 P1         P1        P2       P3
 * HIGH                     P1         P2        P3       P4
 * MEDIUM                   P2         P3        P3       P4
 * LOW                      P3         P4        P4       P4
 *
 * Adjustments:
 * - If affected IT Service is MISSION_CRITICAL or affected users > 100:
 *   Elevates priority by 1 tier (e.g., P2 -> P1, P3 -> P2).
 */
@Component("matrixPriorityCalculator")
public class MatrixPriorityCalculator implements PriorityCalculator {

    @Override
    public PriorityResult calculate(Impact impact, Urgency urgency,
                                    BusinessCriticality criticality, int affectedUserCount) {
        Objects.requireNonNull(impact, "Impact cannot be null");
        Objects.requireNonNull(urgency, "Urgency cannot be null");
        Objects.requireNonNull(criticality, "BusinessCriticality cannot be null");

        Priority basePriority = lookupMatrix(impact, urgency);

        // Environmental adjustment for high blast-radius or mission-critical services
        boolean elevated = false;
        Priority finalPriority = basePriority;

        boolean highImpactEnvironment = criticality == BusinessCriticality.CRITICAL
                || criticality.name().contains("MISSION")
                || affectedUserCount > 100;

        if (highImpactEnvironment && basePriority != Priority.P1) {
            finalPriority = elevateByOneTier(basePriority);
            elevated = true;
        }

        int score = calculateScore(finalPriority, affectedUserCount);
        String rationale = String.format("ITIL Matrix [%s Impact x %s Urgency -> %s]%s",
                impact, urgency, finalPriority,
                elevated ? " (Elevated due to Critical Service/Scale)" : "");

        return new PriorityResult(finalPriority, score, rationale);
    }

    private Priority lookupMatrix(Impact impact, Urgency urgency) {
        return switch (impact) {
            case CRITICAL -> switch (urgency) {
                case CRITICAL, HIGH -> Priority.P1;
                case MEDIUM -> Priority.P2;
                case LOW -> Priority.P3;
            };
            case HIGH -> switch (urgency) {
                case CRITICAL -> Priority.P1;
                case HIGH -> Priority.P2;
                case MEDIUM -> Priority.P3;
                case LOW -> Priority.P4;
            };
            case MEDIUM -> switch (urgency) {
                case CRITICAL -> Priority.P2;
                case HIGH, MEDIUM -> Priority.P3;
                case LOW -> Priority.P4;
            };
            case LOW -> switch (urgency) {
                case CRITICAL -> Priority.P3;
                case HIGH, MEDIUM, LOW -> Priority.P4;
            };
        };
    }

    private Priority elevateByOneTier(Priority current) {
        return switch (current) {
            case P4 -> Priority.P3;
            case P3 -> Priority.P2;
            case P2, P1 -> Priority.P1;
        };
    }

    private int calculateScore(Priority priority, int affectedUsers) {
        int base = switch (priority) {
            case P1 -> 80;
            case P2 -> 60;
            case P3 -> 40;
            case P4 -> 20;
        };
        int bonus = Math.min(affectedUsers / 10, 15);
        return base + bonus;
    }
}
