package com.iitsm.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AddNoteRequest(
        @NotBlank(message = "Note content cannot be blank")
        String content,
        String attachmentName,
        String attachmentType,
        String attachmentData
) {
    public AddNoteRequest(String content) {
        this(content, null, null, null);
    }
}
