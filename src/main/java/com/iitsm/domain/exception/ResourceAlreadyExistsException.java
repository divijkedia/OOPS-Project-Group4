package com.iitsm.domain.exception;

/**
 * Thrown when attempting to create an entity with an identifier, username, or unique code
 * that already exists in the system.
 */
public class ResourceAlreadyExistsException extends RuntimeException {

    public ResourceAlreadyExistsException(String message) {
        super(message);
    }
}
