package com.iitsm.domain.factory;

import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.ItService;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Factory Pattern: Factory encapsulating multi-step instantiation and validation
 * of new Incident aggregates in initial NEW state with zeroed/empty embedded values.
 */
@Component
public class IncidentFactory {

    /**
     * Creates an Incident initialized in NEW state.
     */
    public Incident createIncident(String title, String description, Employee reporter,
                                   ItService affectedService, Impact impact, Urgency urgency,
                                   int affectedUserCount) {
        return createIncident(title, description, reporter, affectedService, impact, urgency, affectedUserCount,
                null, null, null);
    }

    /**
     * Creates an Incident initialized in NEW state with optional screenshot / file attachment.
     */
    public Incident createIncident(String title, String description, Employee reporter,
                                   ItService affectedService, Impact impact, Urgency urgency,
                                   int affectedUserCount, String attachmentName, String attachmentType,
                                   String attachmentData) {
        Objects.requireNonNull(title, "Title cannot be null");
        Objects.requireNonNull(description, "Description cannot be null");
        Objects.requireNonNull(reporter, "Reporter cannot be null");
        Objects.requireNonNull(affectedService, "Affected service cannot be null");
        Objects.requireNonNull(impact, "Impact cannot be null");
        Objects.requireNonNull(urgency, "Urgency cannot be null");

        Incident incident = new Incident(title, description, reporter, affectedService, impact, urgency, affectedUserCount);
        incident.setStatus(IncidentStatus.NEW);
        incident.setPriority(Priority.P4);
        incident.setPriorityScore(1);
        incident.setAttachmentName(attachmentName);
        incident.setAttachmentType(attachmentType);
        incident.setAttachmentData(attachmentData);

        return incident;
    }
}
