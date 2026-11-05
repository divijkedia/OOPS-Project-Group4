package com.iitsm.domain.exception;

import com.iitsm.domain.enums.Priority;

/**
 * Thrown when an incident cannot calculate deadlines because no SLA policy
 * (neither service-specific nor global default) matches its priority level.
 */
public class MissingSlaConfigurationException extends RuntimeException {

    private final Priority priority;
    private final Long serviceId;

    public MissingSlaConfigurationException(Priority priority, Long serviceId) {
        super(String.format("No SLA policy configured for priority %s (serviceId=%s)",
                priority, serviceId != null ? serviceId.toString() : "GLOBAL"));
        this.priority = priority;
        this.serviceId = serviceId;
    }

    public MissingSlaConfigurationException(String message) {
        super(message);
        this.priority = null;
        this.serviceId = null;
    }

    public Priority getPriority() {
        return priority;
    }

    public Long getServiceId() {
        return serviceId;
    }
}
