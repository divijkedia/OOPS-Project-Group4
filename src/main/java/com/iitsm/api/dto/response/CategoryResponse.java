package com.iitsm.api.dto.response;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        String keywords
) {
}
