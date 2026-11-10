package com.iitsm.intelligence;

/**
 * Value object capturing a potential duplicate or correlated incident match,
 * including calculated similarity coefficient and explainable matching tokens.
 */
public record DuplicateMatch(
        Long incidentId,
        String title,
        double similarityScore,
        String matchReason
) {
}
