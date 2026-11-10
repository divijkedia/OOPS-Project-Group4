package com.iitsm.domain.strategy;

import com.iitsm.domain.enums.Priority;

/**
 * Value object (Record) containing the evaluated incident priority,
 * computed numerical score, and transparent formula rationale for auditing.
 */
public record PriorityResult(
        Priority priority,
        int score,
        String rationale
) {
}
