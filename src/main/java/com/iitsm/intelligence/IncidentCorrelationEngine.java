package com.iitsm.intelligence;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.event.IncidentCorrelatedEvent;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.observer.IncidentSubject;
import com.iitsm.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Intelligent Feature 2: Enterprise Incident Correlation & Root Cause Analysis Engine.
 * Implements multi-vector topological, temporal, and symptom correlation to identify
 * incidents associated with common IT services or shared infrastructure components.
 * Correlates cascading failures, calculates systemic blast radius, and detects enterprise outage clusters.
 */
@Component
public class IncidentCorrelationEngine {

    private static final Logger log = LoggerFactory.getLogger(IncidentCorrelationEngine.class);

    public static final double DEFAULT_CORRELATION_THRESHOLD = 0.35; // 35% minimum correlation threshold
    public static final double AUTO_LINK_THRESHOLD = 0.45;           // 45% threshold for automatic bidirectional linking
    public static final int DEFAULT_LOOKBACK_HOURS = 48;             // 48-hour sliding window

    private static final Set<IncidentStatus> CLOSED_STATUSES = Set.of(IncidentStatus.CLOSED);

    // Stop words for token filtering
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "in",
            "to", "for", "of", "with", "by", "from", "as", "into", "like",
            "through", "after", "over", "between", "out", "against", "during",
            "without", "before", "under", "around", "among", "this", "that",
            "these", "those", "it", "its", "are", "was", "were", "been", "be",
            "error", "issue", "problem", "failing", "failed", "down", "not"
    );

    // Upstream Infrastructure Dependency Graph (Service -> Upstream Dependencies)
    private static final Map<String, Set<String>> SERVICE_DEPENDENCY_GRAPH = Map.of(
            "Payment Processing Gateway", Set.of("Customer Database", "User Authentication Service"),
            "Corporate Email Service", Set.of("User Authentication Service", "Internal File Storage"),
            "Workplace Chat Application", Set.of("User Authentication Service")
    );

    // Foundational infrastructure components whose failures cascade across multiple services
    private static final Set<String> FOUNDATIONAL_INFRASTRUCTURE = Set.of(
            "User Authentication Service",
            "Customer Database",
            "Internal File Storage"
    );

    // Symptom Failure Families
    private static final Set<String> DATABASE_SYMPTOMS = Set.of(
            "database", "postgres", "sql", "query", "deadlock", "lock",
            "pool", "table", "connection pool", "transaction", "migration", "corruption"
    );

    private static final Set<String> AUTH_SYMPTOMS = Set.of(
            "auth", "authentication", "sso", "login", "token", "jwt",
            "unauthorized", "forbidden", "credential", "oauth", "session", "directory"
    );

    private static final Set<String> NETWORK_SYMPTOMS = Set.of(
            "network", "wifi", "dns", "unreachable", "refused", "latency",
            "slow", "bandwidth", "packet", "gateway", "disconnected", "502", "503", "504"
    );

    private static final Set<String> SYSTEM_SYMPTOMS = Set.of(
            "crash", "oom", "memory", "cpu", "disk", "timeout", "freeze",
            "fatal", "500", "overload", "resource"
    );

    private final IncidentRepository incidentRepository;
    private final IncidentSubject incidentSubject;

    public IncidentCorrelationEngine(IncidentRepository incidentRepository,
                                     IncidentSubject incidentSubject) {
        this.incidentRepository = incidentRepository;
        this.incidentSubject = incidentSubject;
    }

    /**
     * Analyzes correlations for a target incident against all recent tickets within the sliding lookback window.
     * Computes blast radius, probable root cause component, and individual correlation vectors.
     */
    @Transactional(readOnly = true)
    public IncidentCorrelationReport analyzeCorrelations(Incident target) {
        if (target == null) {
            return new IncidentCorrelationReport(null, "Unknown", 0, 0, 0, "None", Priority.P4, List.of());
        }

        LocalDateTime since = (target.getCreatedAt() != null ? target.getCreatedAt() : LocalDateTime.now())
                .minusHours(DEFAULT_LOOKBACK_HOURS);

        List<Incident> candidates = incidentRepository.findAllRecentWithDetails(since);
        List<CorrelatedIncident> correlations = new ArrayList<>();

        for (Incident other : candidates) {
            if (Objects.equals(other.getId(), target.getId())) {
                continue; // Skip self
            }

            CorrelationResult result = evaluateCorrelation(target, other);
            if (result.score() >= DEFAULT_CORRELATION_THRESHOLD) {
                correlations.add(new CorrelatedIncident(
                        other.getId(),
                        other.getTitle(),
                        other.getAffectedService() != null ? other.getAffectedService().getName() : "Unknown",
                        other.getCategory() != null ? other.getCategory().getName() : "Uncategorized",
                        other.getStatus() != null ? other.getStatus().name() : "NEW",
                        other.getPriority() != null ? other.getPriority() : Priority.P4,
                        other.getAffectedUserCount(),
                        other.getCreatedAt(),
                        result.type(),
                        result.score(),
                        result.sharedComponent(),
                        result.rationale()
                ));
            }
        }

        // Sort correlations by score descending
        correlations.sort(Comparator.comparingDouble(CorrelatedIncident::correlationScore).reversed());

        // Calculate blast radius metrics
        int totalAffectedUsers = target.getAffectedUserCount() +
                correlations.stream().mapToInt(CorrelatedIncident::affectedUserCount).sum();

        Set<String> distinctServices = new HashSet<>();
        if (target.getAffectedService() != null) {
            distinctServices.add(target.getAffectedService().getName());
        }
        correlations.forEach(c -> distinctServices.add(c.serviceName()));

        Priority highestPriority = target.getPriority() != null ? target.getPriority() : Priority.P4;
        for (CorrelatedIncident c : correlations) {
            if (c.priority() != null && c.priority().compareTo(highestPriority) < 0) { // P1 is lowest ordinal (highest severity)
                highestPriority = c.priority();
            }
        }

        String probableRootCause = determineProbableRootCause(target, correlations);

        String targetServiceName = target.getAffectedService() != null ? target.getAffectedService().getName() : "Unknown";

        return new IncidentCorrelationReport(
                target.getId(),
                targetServiceName,
                correlations.size(),
                totalAffectedUsers,
                distinctServices.size(),
                probableRootCause,
                highestPriority,
                correlations
        );
    }

    /**
     * Evaluates a newly created or updated incident, bidirectionally linking strongly correlated tickets,
     * auto-escalating cluster tickets to P1 if systemic thresholds are met, and publishing correlation domain events.
     */
    @Transactional
    public List<CorrelatedIncident> correlateAndLink(Incident target) {
        if (target == null) {
            return List.of();
        }

        IncidentCorrelationReport report = analyzeCorrelations(target);
        List<CorrelatedIncident> linkedMatches = new ArrayList<>();

        for (CorrelatedIncident match : report.correlations()) {
            if (match.correlationScore() >= AUTO_LINK_THRESHOLD) {
                incidentRepository.findById(match.incidentId()).ifPresent(candidate -> {
                    target.linkRelatedIncident(candidate);
                    candidate.linkRelatedIncident(target);
                    incidentRepository.save(candidate);

                    linkedMatches.add(match);

                    // Observer Pattern: Publish Domain Event
                    if (incidentSubject != null) {
                        incidentSubject.notifyObservers(target, new IncidentCorrelatedEvent(
                                target.getId(),
                                candidate.getId(),
                                match.correlationType().name(),
                                match.correlationScore(),
                                match.sharedComponent()
                        ));
                    }

                    log.info("Incident #{} correlated & linked with #{} (Type: {}, Score: {}, Component: '{}')",
                            target.getId(), candidate.getId(), match.correlationType(), match.correlationScore(), match.sharedComponent());
                });
            }
        }

        // Systemic Outage Cluster Auto-Escalation (Workflow 3)
        // Elevate when >= 2 correlated tickets exist and cluster touches critical infrastructure or >= 10 affected users
        if (!linkedMatches.isEmpty() && (report.totalCorrelatedCount() >= 1)) {
            boolean involvesCriticalService = (target.getAffectedService() != null &&
                    target.getAffectedService().getBusinessCriticality() == BusinessCriticality.CRITICAL) ||
                    report.correlations().stream().anyMatch(c -> FOUNDATIONAL_INFRASTRUCTURE.contains(c.serviceName()));

            boolean highBlastRadius = report.blastRadiusUserCount() >= 10 || linkedMatches.size() >= 2;

            if ((involvesCriticalService || highBlastRadius) && target.getPriority() != Priority.P1) {
                log.warn("High-impact outage cluster detected for incident #{}. Blast radius: {} users, root cause: '{}'. Auto-escalating to P1.",
                        target.getId(), report.blastRadiusUserCount(), report.probableRootCause());

                target.setPriority(Priority.P1);
                target.setPriorityScore(Math.max(target.getPriorityScore(), 85));
                target.escalate(EscalationLevel.TEAM_LEAD,
                        String.format("Auto-escalated: Outage cluster detected with %d correlated incidents (Root Cause: %s, Blast Radius: %d users)",
                                report.totalCorrelatedCount() + 1, report.probableRootCause(), report.blastRadiusUserCount()));
            }
            incidentRepository.save(target);
        }

        return linkedMatches;
    }

    /**
     * Detects all active enterprise outage clusters across the entire organization.
     * Uses connected component analysis on correlated incident pairs.
     */
    @Transactional(readOnly = true)
    public List<OutageCluster> detectAllActiveClusters() {
        List<Incident> activeIncidents = incidentRepository.findAllActiveWithDetails(CLOSED_STATUSES);
        if (activeIncidents.size() < 2) {
            return List.of();
        }

        // Build adjacency graph for incidents with correlation score >= AUTO_LINK_THRESHOLD
        Map<Long, Incident> incidentMap = activeIncidents.stream()
                .collect(Collectors.toMap(Incident::getId, i -> i));
        Map<Long, Set<Long>> adj = new HashMap<>();
        for (Long id : incidentMap.keySet()) {
            adj.put(id, new HashSet<>());
        }

        for (int i = 0; i < activeIncidents.size(); i++) {
            Incident a = activeIncidents.get(i);
            for (int j = i + 1; j < activeIncidents.size(); j++) {
                Incident b = activeIncidents.get(j);
                CorrelationResult res = evaluateCorrelation(a, b);
                if (res.score() >= AUTO_LINK_THRESHOLD) {
                    adj.get(a.getId()).add(b.getId());
                    adj.get(b.getId()).add(a.getId());
                }
            }
        }

        // Find connected components (BFS)
        Set<Long> visited = new HashSet<>();
        List<OutageCluster> clusters = new ArrayList<>();
        int clusterCounter = 1;

        for (Long id : incidentMap.keySet()) {
            if (!visited.contains(id)) {
                List<Long> component = new ArrayList<>();
                Queue<Long> queue = new ArrayDeque<>();
                queue.add(id);
                visited.add(id);

                while (!queue.isEmpty()) {
                    Long curr = queue.poll();
                    component.add(curr);
                    for (Long neighbor : adj.getOrDefault(curr, Set.of())) {
                        if (!visited.contains(neighbor)) {
                            visited.add(neighbor);
                            queue.add(neighbor);
                        }
                    }
                }

                // Only record clusters of 2 or more related incidents
                if (component.size() >= 2) {
                    List<Incident> clusterIncidents = component.stream()
                            .map(incidentMap::get)
                            .filter(Objects::nonNull)
                            .sorted(Comparator.comparing(Incident::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                            .toList();

                    int totalUsers = clusterIncidents.stream().mapToInt(Incident::getAffectedUserCount).sum();
                    Priority highestPriority = Priority.P4;
                    for (Incident inc : clusterIncidents) {
                        if (inc.getPriority() != null && inc.getPriority().compareTo(highestPriority) < 0) {
                            highestPriority = inc.getPriority();
                        }
                    }

                    LocalDateTime detectedAt = clusterIncidents.get(0).getCreatedAt() != null
                            ? clusterIncidents.get(0).getCreatedAt()
                            : LocalDateTime.now();

                    List<String> serviceNames = clusterIncidents.stream()
                            .map(inc -> inc.getAffectedService() != null ? inc.getAffectedService().getName() : "Unknown")
                            .distinct()
                            .toList();

                    // Identify cluster shared component & root cause hypothesis
                    String sharedComponent = identifyClusterComponent(clusterIncidents);
                    String rootCauseHypothesis = formulateHypothesis(sharedComponent, clusterIncidents, serviceNames);

                    clusters.add(new OutageCluster(
                            "CLUST-" + String.format("%03d", clusterCounter++),
                            sharedComponent,
                            rootCauseHypothesis,
                            component.size(),
                            totalUsers,
                            highestPriority,
                            detectedAt,
                            component,
                            serviceNames
                    ));
                }
            }
        }

        // Sort by highest priority, then cluster size descending
        clusters.sort(Comparator.comparing(OutageCluster::highestPriority)
                .thenComparing(Comparator.comparingInt(OutageCluster::incidentCount).reversed()));

        return clusters;
    }

    /**
     * Evaluates the correlation between two distinct incidents across service, dependency, temporal, and symptom vectors.
     */
    public CorrelationResult evaluateCorrelation(Incident a, Incident b) {
        if (a == null || b == null) {
            return new CorrelationResult(0.0, CorrelationType.TEMPORAL_SPIKE, "None", "Null incidents");
        }

        double score = 0.0;
        List<String> rationaleParts = new ArrayList<>();
        CorrelationType primaryType = CorrelationType.TEMPORAL_SPIKE;
        String sharedComponent = "Shared IT Infrastructure";

        String serviceA = a.getAffectedService() != null ? a.getAffectedService().getName() : "";
        String serviceB = b.getAffectedService() != null ? b.getAffectedService().getName() : "";
        boolean hasService = !serviceA.isBlank() && !serviceB.isBlank();

        // 1. Service & Infrastructure Dependency Vector
        if (hasService && serviceA.equalsIgnoreCase(serviceB)) {
            score += 0.40;
            primaryType = CorrelationType.SHARED_SERVICE;
            sharedComponent = serviceA;
            rationaleParts.add("Both incidents affect service '" + serviceA + "'");
        } else if (hasService && isDirectDependency(serviceA, serviceB)) {
            score += 0.35;
            primaryType = CorrelationType.INFRASTRUCTURE_DEPENDENCY;
            sharedComponent = getUpstreamService(serviceA, serviceB);
            rationaleParts.add(String.format("Cross-service architectural dependency between '%s' and '%s' (Upstream: %s)",
                    serviceA, serviceB, sharedComponent));
        } else if (hasService && hasSharedUpstreamDependency(serviceA, serviceB)) {
            String upstream = getCommonUpstreamDependency(serviceA, serviceB);
            score += 0.30;
            primaryType = CorrelationType.INFRASTRUCTURE_DEPENDENCY;
            sharedComponent = upstream;
            rationaleParts.add(String.format("Both '%s' and '%s' depend on shared upstream component '%s'",
                    serviceA, serviceB, upstream));
        } else if (a.getCategory() != null && b.getCategory() != null &&
                Objects.equals(a.getCategory().getId(), b.getCategory().getId())) {
            score += 0.10;
            rationaleParts.add("Shared incident category: " + a.getCategory().getName());
        }

        // 2. Temporal Proximity Vector
        LocalDateTime timeA = a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.now();
        LocalDateTime timeB = b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.now();
        long diffMinutes = Math.abs(Duration.between(timeA, timeB).toMinutes());

        if (diffMinutes <= 30) {
            score += 0.25;
            rationaleParts.add(String.format("Co-occurred within %d minutes", diffMinutes));
            if (primaryType == CorrelationType.TEMPORAL_SPIKE) {
                primaryType = CorrelationType.TEMPORAL_SPIKE;
            }
        } else if (diffMinutes <= 120) {
            score += 0.20;
            rationaleParts.add(String.format("Co-occurred within %.1f hours", diffMinutes / 60.0));
        } else if (diffMinutes <= 360) {
            score += 0.15;
            rationaleParts.add(String.format("Co-occurred within %.1f hours", diffMinutes / 60.0));
        } else if (diffMinutes <= 1440) {
            score += 0.10;
            rationaleParts.add("Occurred within 24 hours");
        }

        // 3. Symptom & Failure Pattern Vector
        String textA = (a.getTitle() + " " + a.getDescription()).toLowerCase();
        String textB = (b.getTitle() + " " + b.getDescription()).toLowerCase();

        String matchedSymptomFamily = findMatchedSymptomFamily(textA, textB);
        if (matchedSymptomFamily != null) {
            score += 0.20;
            if (primaryType == CorrelationType.TEMPORAL_SPIKE) {
                primaryType = CorrelationType.SYMPTOM_PATTERN;
                sharedComponent = matchedSymptomFamily;
            }
            rationaleParts.add("Matching systemic failure symptom: " + matchedSymptomFamily);
        }

        // Token overlap (lexical similarity boost)
        Set<String> tokensA = tokenize(textA);
        Set<String> tokensB = tokenize(textB);
        double jaccard = computeJaccardSimilarity(tokensA, tokensB);
        if (jaccard >= 0.20) {
            score += Math.min(0.15, jaccard * 0.25);
            Set<String> overlap = new HashSet<>(tokensA);
            overlap.retainAll(tokensB);
            rationaleParts.add("Shared operational terms: " + String.join(", ", overlap));
        }

        // 4. Severity & Business Criticality Synergy
        boolean bothCritical = (a.getAffectedService() != null && a.getAffectedService().getBusinessCriticality() == BusinessCriticality.CRITICAL) &&
                (b.getAffectedService() != null && b.getAffectedService().getBusinessCriticality() == BusinessCriticality.CRITICAL);
        if (bothCritical) {
            score += 0.05;
            rationaleParts.add("Both affect critical tier services");
        }

        // Final normalization
        double finalScore = Math.min(1.0, Math.round(score * 100.0) / 100.0);
        String rationale = String.join("; ", rationaleParts) + String.format(" (Confidence: %d%%)", Math.round(finalScore * 100));

        return new CorrelationResult(finalScore, primaryType, sharedComponent, rationale);
    }

    private boolean isDirectDependency(String s1, String s2) {
        Set<String> deps1 = SERVICE_DEPENDENCY_GRAPH.getOrDefault(s1, Set.of());
        Set<String> deps2 = SERVICE_DEPENDENCY_GRAPH.getOrDefault(s2, Set.of());
        return deps1.contains(s2) || deps2.contains(s1);
    }

    private String getUpstreamService(String s1, String s2) {
        Set<String> deps1 = SERVICE_DEPENDENCY_GRAPH.getOrDefault(s1, Set.of());
        if (deps1.contains(s2)) return s2;
        Set<String> deps2 = SERVICE_DEPENDENCY_GRAPH.getOrDefault(s2, Set.of());
        if (deps2.contains(s1)) return s1;
        return s1;
    }

    private boolean hasSharedUpstreamDependency(String s1, String s2) {
        Set<String> deps1 = SERVICE_DEPENDENCY_GRAPH.getOrDefault(s1, Set.of());
        Set<String> deps2 = SERVICE_DEPENDENCY_GRAPH.getOrDefault(s2, Set.of());
        return deps1.stream().anyMatch(deps2::contains);
    }

    private String getCommonUpstreamDependency(String s1, String s2) {
        Set<String> deps1 = SERVICE_DEPENDENCY_GRAPH.getOrDefault(s1, Set.of());
        Set<String> deps2 = SERVICE_DEPENDENCY_GRAPH.getOrDefault(s2, Set.of());
        return deps1.stream().filter(deps2::contains).findFirst().orElse("Shared Upstream Infrastructure");
    }

    private String findMatchedSymptomFamily(String textA, String textB) {
        if (containsAny(textA, DATABASE_SYMPTOMS) && containsAny(textB, DATABASE_SYMPTOMS)) {
            return "Database & Transaction Failure Pattern";
        }
        if (containsAny(textA, AUTH_SYMPTOMS) && containsAny(textB, AUTH_SYMPTOMS)) {
            return "Authentication & Directory Access Failure Pattern";
        }
        if (containsAny(textA, NETWORK_SYMPTOMS) && containsAny(textB, NETWORK_SYMPTOMS)) {
            return "Network & Connectivity Disruption Pattern";
        }
        if (containsAny(textA, SYSTEM_SYMPTOMS) && containsAny(textB, SYSTEM_SYMPTOMS)) {
            return "Server Resource & Operating System Failure Pattern";
        }
        return null;
    }

    private boolean containsAny(String text, Set<String> keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) {
                return true;
            }
        }
        return false;
    }

    private String determineProbableRootCause(Incident target, List<CorrelatedIncident> correlations) {
        if (correlations.isEmpty()) {
            return target.getAffectedService() != null ? target.getAffectedService().getName() : "Local Component";
        }

        // 1. Check if any correlated ticket is on a foundational upstream component
        for (CorrelatedIncident c : correlations) {
            if (FOUNDATIONAL_INFRASTRUCTURE.contains(c.serviceName())) {
                return c.serviceName() + " (Foundational Infrastructure Component)";
            }
        }

        // 2. Check if target itself is on foundational infrastructure
        if (target.getAffectedService() != null && FOUNDATIONAL_INFRASTRUCTURE.contains(target.getAffectedService().getName())) {
            return target.getAffectedService().getName() + " (Core Service)";
        }

        // 3. Check for predominant shared component in correlations
        Map<String, Long> componentCounts = correlations.stream()
                .filter(c -> !c.sharedComponent().equalsIgnoreCase("Shared IT Infrastructure"))
                .collect(Collectors.groupingBy(CorrelatedIncident::sharedComponent, Collectors.counting()));

        if (!componentCounts.isEmpty()) {
            return componentCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(target.getAffectedService() != null ? target.getAffectedService().getName() : "Shared Infrastructure");
        }

        return target.getAffectedService() != null ? target.getAffectedService().getName() : "Shared IT Component";
    }

    private String identifyClusterComponent(List<Incident> cluster) {
        // Look for foundational infrastructure
        for (Incident inc : cluster) {
            if (inc.getAffectedService() != null && FOUNDATIONAL_INFRASTRUCTURE.contains(inc.getAffectedService().getName())) {
                return inc.getAffectedService().getName();
            }
        }

        // Check if all on single service
        Set<String> services = cluster.stream()
                .map(inc -> inc.getAffectedService() != null ? inc.getAffectedService().getName() : "Unknown")
                .collect(Collectors.toSet());
        if (services.size() == 1) {
            return services.iterator().next();
        }

        // Check upstream dependencies across services
        for (String service : services) {
            Set<String> upstreams = SERVICE_DEPENDENCY_GRAPH.getOrDefault(service, Set.of());
            for (String upstream : upstreams) {
                if (services.contains(upstream) || FOUNDATIONAL_INFRASTRUCTURE.contains(upstream)) {
                    return upstream;
                }
            }
        }

        return "Enterprise Infrastructure Core";
    }

    private String formulateHypothesis(String sharedComponent, List<Incident> cluster, List<String> services) {
        if (services.size() == 1) {
            return String.format("Localized outage concentrated on '%s' with %d open tickets",
                    services.get(0), cluster.size());
        }
        return String.format("Upstream disruption in '%s' cascading across %d downstream services (%s)",
                sharedComponent, services.size(), String.join(", ", services));
    }

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

    private double computeJaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    public record CorrelationResult(
            double score,
            CorrelationType type,
            String sharedComponent,
            String rationale
    ) {}
}
