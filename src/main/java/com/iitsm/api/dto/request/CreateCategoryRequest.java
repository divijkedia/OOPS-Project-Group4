package com.iitsm.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank(message = "Category name is required")
        @Size(max = 50, message = "Category name cannot exceed 50 characters")
        String name,

        String description,

        String keywords
) {
}
