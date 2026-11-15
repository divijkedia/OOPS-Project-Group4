package com.iitsm.repository;

import com.iitsm.domain.model.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for immutable Audit Records.
 */
@Repository
public interface AuditRecordRepository extends JpaRepository<AuditRecord, Long> {

    List<AuditRecord> findByIncidentIdOrderByTimestampDesc(Long incidentId);

    List<AuditRecord> findByUserIdOrderByTimestampDesc(Long userId);

    List<AuditRecord> findAllByOrderByTimestampDesc();
}
