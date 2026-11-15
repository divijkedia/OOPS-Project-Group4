package com.iitsm.api.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String code,
        String message,
        String path,
        List<String> details
) {
    public ErrorResponse(int status, String error, String code, String message, String path) {
        this(LocalDateTime.now(), status, error, code, message, path, List.of());
    }

    public ErrorResponse(int status, String error, String code, String message, String path, List<String> details) {
        this(LocalDateTime.now(), status, error, code, message, path, details);
    }
}
