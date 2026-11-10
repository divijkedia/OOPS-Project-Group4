package com.iitsm.domain.strategy;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Urgency;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Strategy Pattern Implementation: Weighted scoring priority calculator.
 * Computes a multi-factor score:
 * Base Score = Impact.weight (1-4) x Urgency.weight (1-4) x BusinessCriticality.weight (1-4) [Range: 1..64]
 * Affected User Bonus = +10 (>100 users), +5 (>50 users), +2 (>10 users), +0 (<=10 users)
 * Total Score = Base Score + Affected User Bonus.
 *
 * Mapping to ITIL Priority:
 * - Total Score >= 48 -> P1 (Critical)
 * - Total Score >= 18 -> P2 (High)
 * - Total Score >= 6  -> P3 (Medium)
 * - Total Score < 6   -> P4 (Low)
 */
@org.springframework.context.annotation.Primary
@Component("weightedPriorityCalculator")
public class WeightedPriorityCalculator implements PriorityCalculator {

    public static final int P1_THRESHOLD = 48;
    public static final int P2_THRESHOLD = 18;
    public static final int P3_THRESHOLD = 6;

    @Override
    public PriorityResult calculate(Impact impact, Urgency urgency,
                                    BusinessCriticality criticality, int affectedUserCount) {
        Objects.requireNonNull(impact, "Impact cannot be null");
        Objects.requireNonNull(urgency, "Urgency cannot be null");
        Objects.requireNonNull(criticality, "BusinessCriticality cannot be null");

        int baseScore = impact.getWeight() * urgency.getWeight() * criticality.getWeight();

        int userBonus = 0;
        if (affectedUserCount > 100) {
            userBonus = 10;
        } else if (affectedUserCount > 50) {
            userBonus = 5;
        } else if (affectedUserCount > 10) {
            userBonus = 2;
        }

        int totalScore = baseScore + userBonus;

        Priority priority;
        if (totalScore >= P1_THRESHOLD) {
            priority = Priority.P1;
        } else if (totalScore >= P2_THRESHOLD) {
            priority = Priority.P2;
        } else if (totalScore >= P3_THRESHOLD) {
            priority = Priority.P3;
        } else {
            priority = Priority.P4;
        }

        String rationale = String.format(
                "Base Score = Impact(%d) x Urgency(%d) x Criticality(%d) = %d; " +
                        "Affected Users(%d) bonus = +%d; Total Score = %d -> Assigned %s (%s)",
                impact.getWeight(), urgency.getWeight(), criticality.getWeight(), baseScore,
                affectedUserCount, userBonus, totalScore, priority.name(), priority.getLabel()
        );

        return new PriorityResult(priority, totalScore, rationale);
    }
}
