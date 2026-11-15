package com.iitsm.repository;

import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.Technician;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Spring Data JPA repository for the Incident Aggregate Root.
 * Extends JpaSpecificationExecutor to support dynamic, multi-criteria filtering
 * (ID, date range, status, priority, category, service, technician, SLA status).
 */
@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long>, JpaSpecificationExecutor<Incident> {

    @EntityGraph(attributePaths = {"affectedService", "category", "reporter", "assignedTechnician"})
    List<Incident> findByReporterOrderByCreatedAtDesc(Employee reporter);

    @EntityGraph(attributePaths = {"affectedService", "category", "reporter", "assignedTechnician"})
    Page<Incident> findByReporter(Employee reporter, Pageable pageable);

    @EntityGraph(attributePaths = {"affectedService", "category", "reporter", "assignedTechnician"})
    List<Incident> findByAssignedTechnicianOrderByCreatedAtDesc(Technician technician);

    @EntityGraph(attributePaths = {"affectedService", "category", "reporter", "assignedTechnician"})
    Page<Incident> findByAssignedTechnician(Technician technician, Pageable pageable);

    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findByStatusNotIn(Collection<IncidentStatus> terminalStatuses);

    long countByStatus(IncidentStatus status);

    long countByPriority(Priority priority);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status NOT IN :closedStatuses")
    long countOpenIncidents(@Param("closedStatuses") Collection<IncidentStatus> closedStatuses);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.slaTracking.responseBreached = true OR i.slaTracking.resolutionBreached = true")
    long countSlaViolations();

    @Query("SELECT i.affectedService.name, COUNT(i) FROM Incident i GROUP BY i.affectedService.name")
    List<Object[]> countIncidentsByService();

    @Query("SELECT i.assignedTechnician.id, i.assignedTechnician.fullName, COUNT(i) FROM Incident i " +
            "WHERE i.assignedTechnician IS NOT NULL AND i.status NOT IN :closedStatuses " +
            "GROUP BY i.assignedTechnician.id, i.assignedTechnician.fullName")
    List<Object[]> countActiveIncidentsPerTechnician(@Param("closedStatuses") Collection<IncidentStatus> closedStatuses);

    @Query("SELECT i FROM Incident i LEFT JOIN FETCH i.affectedService WHERE i.affectedService.id = :serviceId AND i.createdAt >= :since")
    List<Incident> findRecentIncidentsByService(@Param("serviceId") Long serviceId, @Param("since") LocalDateTime since);

    @Query("SELECT DISTINCT i FROM Incident i " +
            "LEFT JOIN FETCH i.affectedService " +
            "LEFT JOIN FETCH i.category " +
            "LEFT JOIN FETCH i.reporter " +
            "WHERE i.createdAt >= :since")
    List<Incident> findAllRecentWithDetails(@Param("since") LocalDateTime since);

    @Query("SELECT DISTINCT i FROM Incident i " +
            "LEFT JOIN FETCH i.affectedService " +
            "LEFT JOIN FETCH i.category " +
            "LEFT JOIN FETCH i.reporter " +
            "WHERE i.status NOT IN :closedStatuses")
    List<Incident> findAllActiveWithDetails(@Param("closedStatuses") Collection<IncidentStatus> closedStatuses);
}
