package com.iitsm.domain.strategy;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Urgency;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Strategy Pattern: Weighted Priority Calculator")
class WeightedPriorityCalculatorTest {

    private WeightedPriorityCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new WeightedPriorityCalculator();
    }

    @Test
    @DisplayName("Should evaluate to P1 (Critical) for maximum impact, urgency, criticality and high affected users")
    void shouldReturnP1ForMaxScores() {
        // Base = 4 x 4 x 4 = 64, User bonus (>100) = 10 -> Total = 74 >= 48
        PriorityResult result = calculator.calculate(
                Impact.CRITICAL,
                Urgency.CRITICAL,
                BusinessCriticality.CRITICAL,
                150
        );

        assertEquals(Priority.P1, result.priority());
        assertEquals(74, result.score());
        assertTrue(result.rationale().contains("P1"));
    }

    @Test
    @DisplayName("Should evaluate to P4 (Low) for minimum impact, urgency, and criticality")
    void shouldReturnP4ForMinScores() {
        // Base = 1 x 1 x 1 = 1, User bonus (1) = 0 -> Total = 1 < 6
        PriorityResult result = calculator.calculate(
                Impact.LOW,
                Urgency.LOW,
                BusinessCriticality.LOW,
                1
        );

        assertEquals(Priority.P4, result.priority());
        assertEquals(1, result.score());
    }

    @Test
    @DisplayName("Should boost priority tier when large number of users are affected (>100 users)")
    void shouldBoostPriorityForHighAffectedUsers() {
        // Impact=MEDIUM(2), Urgency=HIGH(3), Criticality=MEDIUM(2) -> Base = 12 (P3)
        PriorityResult withoutBonus = calculator.calculate(
                Impact.MEDIUM,
                Urgency.HIGH,
                BusinessCriticality.MEDIUM,
                5
        );
        assertEquals(Priority.P3, withoutBonus.priority());
        assertEquals(12, withoutBonus.score());

        // Same factors, but 120 users affected -> Base 12 + 10 user bonus = 22 (P2)
        PriorityResult withBonus = calculator.calculate(
                Impact.MEDIUM,
                Urgency.HIGH,
                BusinessCriticality.MEDIUM,
                120
        );
        assertEquals(Priority.P2, withBonus.priority());
        assertEquals(22, withBonus.score());
    }

    @Test
    @DisplayName("Should correctly map exact boundary thresholds (6 -> P3, 18 -> P2, 48 -> P1)")
    void shouldHandleExactBoundaryThresholds() {
        // Score = 6 (e.g. 1 x 2 x 3 + 0 = 6) -> Exactly P3
        PriorityResult p3 = calculator.calculate(Impact.LOW, Urgency.MEDIUM, BusinessCriticality.HIGH, 1);
        assertEquals(6, p3.score());
        assertEquals(Priority.P3, p3.priority());

        // Score = 18 (e.g. 3 x 3 x 2 + 0 = 18) -> Exactly P2
        PriorityResult p2 = calculator.calculate(Impact.HIGH, Urgency.HIGH, BusinessCriticality.MEDIUM, 1);
        assertEquals(18, p2.score());
        assertEquals(Priority.P2, p2.priority());

        // Score = 48 (e.g. 4 x 4 x 3 + 0 = 48) -> Exactly P1
        PriorityResult p1 = calculator.calculate(Impact.CRITICAL, Urgency.CRITICAL, BusinessCriticality.HIGH, 1);
        assertEquals(48, p1.score());
        assertEquals(Priority.P1, p1.priority());
    }
}
