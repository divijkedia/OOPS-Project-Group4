package com.iitsm.domain.strategy;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Urgency;

/**
 * Strategy Pattern: Strategy interface for calculating incident priority.
 * Allows interchangeable scoring algorithms (e.g. weighted formula, matrix-based, AI-assisted)
 * without modifying incident domain logic.
 */
public interface PriorityCalculator {

    /**
     * Calculates the priority result based on incident characteristics.
     *
     * @param impact operational scope of damage
     * @param urgency time-sensitivity of remediation
     * @param criticality mission importance of the affected IT service
     * @param affectedUserCount number of employees/customers impacted
     * @return evaluated PriorityResult containing Priority, numerical score, and rationale
     */
    PriorityResult calculate(Impact impact, Urgency urgency, BusinessCriticality criticality, int affectedUserCount);
}
