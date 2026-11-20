package com.iitsm.intelligence;

import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.ItService;
import com.iitsm.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Intelligent: Automated Duplicate Incident Detector")
class DuplicateDetectorTest {

    @Mock
    private IncidentRepository incidentRepository;

    private DuplicateDetector duplicateDetector;

    @BeforeEach
    void setUp() {
        duplicateDetector = new DuplicateDetector(incidentRepository);
    }

    @Test
    @DisplayName("Should compute high Jaccard similarity (>= 0.40) for nearly identical incident descriptions")
    void shouldDetectSimilarDescriptions() {
        String textA = "Database connection pool timeout on checkout payment gateway";
        String textB = "Payment gateway database connection timeout during customer order";

        double similarity = duplicateDetector.computeSimilarity(textA, textB);

        assertTrue(similarity >= 0.40, "Expected similarity >= 0.40 but was: " + similarity);
    }

    @Test
    @DisplayName("Should compute low Jaccard similarity (< 0.40) for unrelated issues")
    void shouldNotFlagDissimilarDescriptions() {
        String textA = "Database connection pool timeout on payment gateway";
        String textB = "Printer hardware roller jam on marketing floor 2";

        double similarity = duplicateDetector.computeSimilarity(textA, textB);

        assertTrue(similarity < 0.20, "Expected low similarity for distinct issues but was: " + similarity);
    }

    @Test
    @DisplayName("Should extract lowercase tokens while eliminating stop words")
    void shouldTokenizeAndFilterStopWords() {
        String text = "The database is down and it was not reachable from the network";
        Set<String> tokens = duplicateDetector.tokenize(text);

        assertTrue(tokens.contains("database"));
        assertTrue(tokens.contains("reachable"));
        assertTrue(tokens.contains("network"));
        assertFalse(tokens.contains("the"));
        assertFalse(tokens.contains("is"));
        assertFalse(tokens.contains("and"));
        assertFalse(tokens.contains("was"));
    }

    @Test
    @DisplayName("Should detect and bidirectionally link duplicates on same IT service within lookback window")
    void shouldDetectAndLinkDuplicatesOnSameService() {
        ItService service = new ItService();
        service.setId(1L);
        service.setName("Payment Gateway");

        Incident existing = new Incident();
        existing.setId(201L);
        existing.setTitle("Payment checkout database connection timeout");
        existing.setDescription("Postgres queries timing out for payment gateway transactions");
        existing.setAffectedService(service);
        existing.setCreatedAt(LocalDateTime.now().minusDays(1));

        Incident target = new Incident();
        target.setId(202L);
        target.setTitle("Checkout payment database connection timeout");
        target.setDescription("Transactions failing due to database timeout on payment gateway");
        target.setAffectedService(service);
        target.setCreatedAt(LocalDateTime.now());

        when(incidentRepository.findRecentIncidentsByService(eq(1L), any())).thenReturn(List.of(existing));
        when(incidentRepository.findById(201L)).thenReturn(Optional.of(existing));

        List<DuplicateMatch> matches = duplicateDetector.detectAndLinkDuplicates(target);

        assertFalse(matches.isEmpty());
        assertEquals(201L, matches.get(0).incidentId());
        assertTrue(matches.get(0).similarityScore() >= 0.40);
        assertTrue(target.getRelatedIncidents().contains(existing));
        assertTrue(existing.getRelatedIncidents().contains(target));
        verify(incidentRepository).save(existing);
    }
}
