package com.iitsm.domain.exception;

/**
 * Thrown when an incident category cannot be located by ID or name.
 */
public class CategoryNotFoundException extends RuntimeException {

    private final Long categoryId;

    public CategoryNotFoundException(Long categoryId) {
        super(String.format("Incident Category with ID %d not found", categoryId));
        this.categoryId = categoryId;
    }

    public CategoryNotFoundException(String message) {
        super(message);
        this.categoryId = null;
    }

    public Long getCategoryId() {
        return categoryId;
    }
}
