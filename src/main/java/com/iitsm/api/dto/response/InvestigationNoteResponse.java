package com.iitsm.api.dto.response;

import java.time.LocalDateTime;

public record InvestigationNoteResponse(
        Long id,
        Long incidentId,
        Long authorId,
        String authorName,
        String content,
        String attachmentName,
        String attachmentType,
        String attachmentData,
        LocalDateTime createdAt
) {
    public InvestigationNoteResponse(Long id, Long incidentId, Long authorId, String authorName,
                                     String content, LocalDateTime createdAt) {
        this(id, incidentId, authorId, authorName, content, null, null, null, createdAt);
    }
}
