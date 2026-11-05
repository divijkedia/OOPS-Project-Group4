package com.iitsm.domain.exception;

/**
 * Thrown when a user query by ID or username yields no result.
 */
public class UserNotFoundException extends RuntimeException {

    private final String identifier;

    public UserNotFoundException(Long userId) {
        super(String.format("User with ID %d not found", userId));
        this.identifier = String.valueOf(userId);
    }

    public UserNotFoundException(String username) {
        super(String.format("User with username '%s' not found", username));
        this.identifier = username;
    }

    public String getIdentifier() {
        return identifier;
    }
}
