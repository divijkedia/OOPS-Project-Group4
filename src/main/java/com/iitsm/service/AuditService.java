package com.iitsm.service;

import com.iitsm.domain.enums.AuditAction;
import com.iitsm.domain.model.AuditRecord;
import com.iitsm.repository.AuditRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing the immutable Incident Audit Trail.
 */
@Service
@Transactional(readOnly = true)
public class AuditService {

    private final AuditRecordRepository auditRecordRepository;

    public AuditService(AuditRecordRepository auditRecordRepository) {
        this.auditRecordRepository = auditRecordRepository;
    }

    public List<AuditRecord> getAuditTrailForIncident(Long incidentId) {
        return auditRecordRepository.findByIncidentIdOrderByTimestampDesc(incidentId);
    }

    public List<AuditRecord> getAllAuditRecords() {
        return auditRecordRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditRecord> getAuditTrailForUser(Long userId) {
        return auditRecordRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @Transactional
    public AuditRecord recordAction(Long userId, String username, AuditAction action,
                                    Long incidentId, String previousState, String newState,
                                    String description) {
        AuditRecord record = new AuditRecord(userId, username, action, incidentId,
                previousState, newState, description);
        return auditRecordRepository.save(record);
    }
}
