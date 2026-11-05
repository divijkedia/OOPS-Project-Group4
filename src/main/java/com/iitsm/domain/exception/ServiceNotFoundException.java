package com.iitsm.domain.exception;

/**
 * Thrown when an IT Service requested by ID or name cannot be found.
 */
public class ServiceNotFoundException extends RuntimeException {

    private final Long serviceId;

    public ServiceNotFoundException(Long serviceId) {
        super(String.format("IT Service with ID %d not found", serviceId));
        this.serviceId = serviceId;
    }

    public ServiceNotFoundException(String message) {
        super(message);
        this.serviceId = null;
    }

    public Long getServiceId() {
        return serviceId;
    }
}
