package com.iitsm.domain.strategy;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Urgency;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Strategy Pattern: ITIL Matrix Priority Calculator Test")
class MatrixPriorityCalculatorTest {

    private MatrixPriorityCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new MatrixPriorityCalculator();
    }

    @Test
    @DisplayName("Should evaluate Critical Impact and Critical Urgency to P1")
    void shouldEvaluateCriticalToP1() {
        PriorityResult result = calculator.calculate(
                Impact.CRITICAL,
                Urgency.CRITICAL,
                BusinessCriticality.MEDIUM,
                10
        );

        assertEquals(Priority.P1, result.priority());
        assertTrue(result.score() >= 80);
    }

    @Test
    @DisplayName("Should evaluate Low Impact and Low Urgency to P4")
    void shouldEvaluateLowToP4() {
        PriorityResult result = calculator.calculate(
                Impact.LOW,
                Urgency.LOW,
                BusinessCriticality.LOW,
                1
        );

        assertEquals(Priority.P4, result.priority());
    }

    @Test
    @DisplayName("Should elevate P2 to P1 for mission-critical IT services")
    void shouldElevateForCriticalService() {
        // High Impact + High Urgency normally maps to P2 in ITIL matrix
        PriorityResult normal = calculator.calculate(
                Impact.HIGH,
                Urgency.HIGH,
                BusinessCriticality.MEDIUM,
                5
        );
        assertEquals(Priority.P2, normal.priority());

        // Under Critical service, it elevates to P1
        PriorityResult elevated = calculator.calculate(
                Impact.HIGH,
                Urgency.HIGH,
                BusinessCriticality.CRITICAL,
                5
        );
        assertEquals(Priority.P1, elevated.priority());
        assertTrue(elevated.rationale().contains("Elevated"));
    }
}
