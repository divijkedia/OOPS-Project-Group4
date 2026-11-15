package com.iitsm.service;

import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.exception.MissingSlaConfigurationException;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.SlaPolicy;
import com.iitsm.domain.model.SlaTracking;
import com.iitsm.repository.SlaPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service managing Service Level Agreement policies, hierarchical lookup
 * (service-specific overriding global defaults), and deadline calculation.
 */
@Service
@Transactional(readOnly = true)
public class SlaPolicyService {

    private final SlaPolicyRepository slaPolicyRepository;

    public SlaPolicyService(SlaPolicyRepository slaPolicyRepository) {
        this.slaPolicyRepository = slaPolicyRepository;
    }

    public List<SlaPolicy> getAllPolicies() {
        return slaPolicyRepository.findAll();
    }

    public SlaPolicy getPolicyById(Long id) {
        return slaPolicyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("SLA policy not found with ID: " + id));
    }

    /**
     * Finds the applicable SLA policy by checking service-specific policy first,
     * falling back to the global default for that priority level.
     *
     * @param priority incident priority
     * @param service affected IT service (may be null)
     * @return applicable SlaPolicy
     * @throws MissingSlaConfigurationException if no matching policy exists
     */
    public SlaPolicy resolvePolicy(Priority priority, ItService service) {
        if (service != null) {
            Optional<SlaPolicy> servicePolicy = slaPolicyRepository.findByPriorityAndItService(priority, service);
            if (servicePolicy.isPresent()) {
                return servicePolicy.get();
            }
        }

        // Global default fallback (service_id is null)
        return slaPolicyRepository.findByPriorityAndItServiceIsNull(priority)
                .orElseThrow(() -> new MissingSlaConfigurationException(priority, service != null ? service.getId() : null));
    }

    /**
     * Computes the SlaTracking value object for an incident based on resolved policy and creation time.
     */
    public SlaTracking calculateSlaTracking(Priority priority, ItService service, LocalDateTime createdAt) {
        SlaPolicy policy = resolvePolicy(priority, service);
        LocalDateTime baseTime = createdAt != null ? createdAt : LocalDateTime.now();

        LocalDateTime responseDeadline = baseTime.plusMinutes(policy.getResponseTargetMinutes());
        LocalDateTime resolutionDeadline = baseTime.plusMinutes(policy.getResolutionTargetMinutes());

        return new SlaTracking(
                policy.getResponseTargetMinutes(),
                policy.getResolutionTargetMinutes(),
                responseDeadline,
                resolutionDeadline
        );
    }

    @Transactional
    public SlaPolicy createPolicy(Priority priority, ItService service, int responseMinutes, int resolutionMinutes) {
        SlaPolicy policy = new SlaPolicy(priority, service, responseMinutes, resolutionMinutes);
        return slaPolicyRepository.save(policy);
    }

    @Transactional
    public SlaPolicy updatePolicy(Long id, int responseMinutes, int resolutionMinutes) {
        SlaPolicy policy = getPolicyById(id);
        policy.setResponseTargetMinutes(responseMinutes);
        policy.setResolutionTargetMinutes(resolutionMinutes);
        return slaPolicyRepository.save(policy);
    }

    @Transactional
    public void deletePolicy(Long id) {
        slaPolicyRepository.deleteById(id);
    }
}
