package com.iitsm.repository;

import com.iitsm.domain.model.InvestigationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for Investigation diagnostic notes.
 */
@Repository
public interface InvestigationNoteRepository extends JpaRepository<InvestigationNote, Long> {

    List<InvestigationNote> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);
}
