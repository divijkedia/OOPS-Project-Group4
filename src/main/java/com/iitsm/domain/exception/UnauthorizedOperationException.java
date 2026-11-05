package com.iitsm.domain.exception;

/**
 * Thrown when an authenticated user attempts an operation violating business ownership rules
 * (e.g. an employee modifying another employee's incident, or a technician resolving an unassigned ticket).
 */
public class UnauthorizedOperationException extends RuntimeException {

    public UnauthorizedOperationException(String message) {
        super(message);
    }
}
