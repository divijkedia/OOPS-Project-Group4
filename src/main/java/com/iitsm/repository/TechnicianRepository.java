package com.iitsm.repository;

import com.iitsm.domain.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Technician entities.
 */
@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {

    Optional<Technician> findByUsername(String username);

    List<Technician> findByActiveTrue();

    @Query("SELECT DISTINCT t FROM Technician t LEFT JOIN FETCH t.skills WHERE t.active = true AND t.available = true")
    List<Technician> findByActiveTrueAndAvailableTrue();

    @Query("SELECT DISTINCT t FROM Technician t LEFT JOIN FETCH t.skills WHERE t.active = true AND t.available = true AND t.activeIncidentCount < t.maxWorkload")
    List<Technician> findEligibleTechnicians();
}
