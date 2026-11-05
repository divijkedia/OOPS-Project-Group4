package com.iitsm.domain.exception;

/**
 * Thrown during authentication when username is not found or password does not match.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
