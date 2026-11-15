package com.iitsm.repository;

import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.SlaPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Service Level Agreement (SLA) policies.
 */
@Repository
public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, Long> {

    Optional<SlaPolicy> findByPriorityAndItService(Priority priority, ItService itService);

    Optional<SlaPolicy> findByPriorityAndItServiceIsNull(Priority priority);

    List<SlaPolicy> findByPriority(Priority priority);

    List<SlaPolicy> findByItService(ItService itService);

    List<SlaPolicy> findByItServiceIsNull();
}
