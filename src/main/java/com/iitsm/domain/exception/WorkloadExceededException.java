package com.iitsm.domain.exception;

/**
 * Thrown when assigning an incident would exceed a technician's maximum concurrent workload capacity.
 */
public class WorkloadExceededException extends RuntimeException {

    private final Long technicianId;
    private final int currentWorkload;
    private final int maxWorkload;

    public WorkloadExceededException(Long technicianId, int currentWorkload, int maxWorkload) {
        super(String.format("Technician with ID %d has reached maximum workload limit (%d/%d active incidents)",
                technicianId, currentWorkload, maxWorkload));
        this.technicianId = technicianId;
        this.currentWorkload = currentWorkload;
        this.maxWorkload = maxWorkload;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public int getCurrentWorkload() {
        return currentWorkload;
    }

    public int getMaxWorkload() {
        return maxWorkload;
    }
}
