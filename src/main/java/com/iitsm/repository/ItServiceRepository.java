package com.iitsm.repository;

import com.iitsm.domain.model.ItService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for IT Service catalog.
 */
@Repository
public interface ItServiceRepository extends JpaRepository<ItService, Long> {

    Optional<ItService> findByName(String name);

    List<ItService> findByActiveTrue();

    boolean existsByName(String name);
}
