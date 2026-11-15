package com.iitsm.repository;

import com.iitsm.domain.model.IncidentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for data-driven Incident Categories.
 */
@Repository
public interface IncidentCategoryRepository extends JpaRepository<IncidentCategory, Long> {

    Optional<IncidentCategory> findByName(String name);

    boolean existsByName(String name);
}
