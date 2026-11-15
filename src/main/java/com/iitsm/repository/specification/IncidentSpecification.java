package com.iitsm.repository.specification;

import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.model.Incident;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Spring Data JPA Specification builder for dynamic, multi-criteria incident filtering.
 * Supports filtering by keyword, status, priority, category, service, technician,
 * reporter, SLA health, and date ranges.
 */
public final class IncidentSpecification {

    private IncidentSpecification() {
        // Utility class
    }

    public static Specification<Incident> filter(
            String search,
            IncidentStatus status,
            Priority priority,
            Long categoryId,
            Long serviceId,
            Long technicianId,
            Long reporterId,
            SlaStatus slaStatus,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Text search across title and description
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);

                // If search is numeric, also check if it matches the incident ID
                try {
                    Long idVal = Long.parseLong(search.trim());
                    Predicate idMatch = cb.equal(root.get("id"), idVal);
                    predicates.add(cb.or(titleMatch, descMatch, idMatch));
                } catch (NumberFormatException ignored) {
                    predicates.add(cb.or(titleMatch, descMatch));
                }
            }

            // 2. Incident Status
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 3. Priority
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            // 4. Incident Category
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            // 5. IT Service
            if (serviceId != null) {
                predicates.add(cb.equal(root.get("affectedService").get("id"), serviceId));
            }

            // 6. Assigned Technician
            if (technicianId != null) {
                predicates.add(cb.equal(root.get("assignedTechnician").get("id"), technicianId));
            }

            // 7. Reporter
            if (reporterId != null) {
                predicates.add(cb.equal(root.get("reporter").get("id"), reporterId));
            }

            // 8. SLA Status
            if (slaStatus != null) {
                predicates.add(cb.equal(root.get("slaTracking").get("slaStatus"), slaStatus));
            }

            // 9. Created At Date Range
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
