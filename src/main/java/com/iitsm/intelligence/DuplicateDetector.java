package com.iitsm.intelligence;

import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.model.Incident;
import com.iitsm.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Intelligent Feature 1: Automated Duplicate & Correlated Incident Detection.
 * Utilizes tokenized Jaccard similarity to correlate recurring system anomalies
 * across identical IT services within a 7-day sliding window.
 */
@Component
public class DuplicateDetector {

    private static final Logger log = LoggerFactory.getLogger(DuplicateDetector.class);

    public static final double DEFAULT_SIMILARITY_THRESHOLD = 0.40; // 40% Jaccard token overlap
    private static final int DEFAULT_LOOKBACK_DAYS = 7;

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "in",
            "to", "for", "of", "with", "by", "from", "as", "into", "like",
            "through", "after", "over", "between", "out", "against", "during",
            "without", "before", "under", "around", "among", "this", "that",
            "these", "those", "it", "its", "are", "was", "were", "been", "be"
    );

    private final IncidentRepository incidentRepository;

    public DuplicateDetector(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    /**
     * Evaluates a newly created incident against recent service history.
     * When Jaccard similarity meets or exceeds the threshold, incidents are bidirectionally
     * linked in the domain model as correlated tickets.
     */
    @Transactional
    public List<DuplicateMatch> detectAndLinkDuplicates(Incident incident) {
        if (incident == null || incident.getAffectedService() == null) {
            return List.of();
        }

        List<DuplicateMatch> matches = findDuplicates(incident, DEFAULT_SIMILARITY_THRESHOLD);

        for (DuplicateMatch match : matches) {
            incidentRepository.findById(match.incidentId()).ifPresent(candidate -> {
                incident.linkRelatedIncident(candidate);
                candidate.linkRelatedIncident(incident);
                incidentRepository.save(candidate);
                log.info("Correlated incident #{} automatically linked with duplicate #{} (Similarity: {})",
                        incident.getId(), candidate.getId(), match.similarityScore());
            });
        }

        if (!matches.isEmpty()) {
            // Workflow 3: Multiple incidents reported -> system identifies duplicates/related incidents -> incidents correlated/escalated
            if (matches.size() >= 2 && incident.getPriority() != Priority.P1) {
                log.warn("Cluster of {} duplicate incidents detected for service #{}. Auto-escalating incident #{} to P1.",
                        matches.size() + 1, incident.getAffectedService().getId(), incident.getId());
                incident.setPriority(Priority.P1);
                incident.setPriorityScore(Math.max(incident.getPriorityScore(), 80));
                incident.escalate(EscalationLevel.TEAM_LEAD,
                        String.format("Auto-escalated due to %d correlated duplicate reports on service", matches.size()));
            }
            incidentRepository.save(incident);
        }

        return matches;
    }

    /**
     * Discovers potential duplicates for an existing incident using the default similarity threshold.
     */
    @Transactional(readOnly = true)
    public List<DuplicateMatch> findDuplicates(Incident incident) {
        return findDuplicates(incident, DEFAULT_SIMILARITY_THRESHOLD);
    }

    /**
     * Discovers potential duplicates with a custom similarity threshold.
     */
    @Transactional(readOnly = true)
    public List<DuplicateMatch> findDuplicates(Incident incident, double threshold) {
        if (incident == null || incident.getAffectedService() == null) {
            return List.of();
        }

        Long serviceId = incident.getAffectedService().getId();
        LocalDateTime since = incident.getCreatedAt() != null
                ? incident.getCreatedAt().minusDays(DEFAULT_LOOKBACK_DAYS)
                : LocalDateTime.now().minusDays(DEFAULT_LOOKBACK_DAYS);

        List<Incident> recentIncidents = incidentRepository.findRecentIncidentsByService(serviceId, since);
        List<DuplicateMatch> matches = new ArrayList<>();

        String targetText = (incident.getTitle() + " " + incident.getDescription()).trim();
        Set<String> targetTokens = tokenize(targetText);

        for (Incident other : recentIncidents) {
            if (Objects.equals(other.getId(), incident.getId())) {
                continue; // Skip self
            }

            String otherText = (other.getTitle() + " " + other.getDescription()).trim();
            Set<String> otherTokens = tokenize(otherText);

            double score = computeJaccardSimilarity(targetTokens, otherTokens);
            if (score >= threshold) {
                Set<String> overlap = new HashSet<>(targetTokens);
                overlap.retainAll(otherTokens);

                String reason = String.format("Jaccard token overlap of %.2f on service '%s' (Shared terms: %s)",
                        score,
                        other.getAffectedService() != null ? other.getAffectedService().getName() : "Unknown",
                        String.join(", ", overlap));

                matches.add(new DuplicateMatch(
                        other.getId(),
                        other.getTitle(),
                        Math.round(score * 100.0) / 100.0,
                        reason
                ));
            }
        }

        return matches;
    }

    /**
     * Calculates Jaccard similarity coefficient: |A INTERSECT B| / |A UNION B|.
     */
    public double computeSimilarity(String textA, String textB) {
        Set<String> tokensA = tokenize(textA);
        Set<String> tokensB = tokenize(textB);
        return computeJaccardSimilarity(tokensA, tokensB);
    }

    private double computeJaccardSimilarity(Set<String> tokensA, Set<String> tokensB) {
        if (tokensA.isEmpty() || tokensB.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(tokensA);
        intersection.retainAll(tokensB);

        Set<String> union = new HashSet<>(tokensA);
        union.addAll(tokensB);

        if (union.isEmpty()) {
            return 0.0;
        }

        return (double) intersection.size() / union.size();
    }

    /**
     * Splits text into lowercase alphanumeric tokens, filtering stop words and short characters.
     */
    public Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(text.toLowerCase().split("[^a-z0-9]+"))
                .map(String::trim)
                .filter(token -> token.length() > 2)
                .filter(token -> !STOP_WORDS.contains(token))
                .collect(Collectors.toSet());
    }
}
