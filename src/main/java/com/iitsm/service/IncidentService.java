package com.iitsm.service;

import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.event.DomainEvent;
import com.iitsm.domain.event.IncidentAssignedEvent;
import com.iitsm.domain.event.IncidentClosedEvent;
import com.iitsm.domain.event.IncidentCreatedEvent;
import com.iitsm.domain.event.IncidentPriorityChangedEvent;
import com.iitsm.domain.event.IncidentResolvedEvent;
import com.iitsm.domain.event.IncidentStatusChangedEvent;
import com.iitsm.domain.event.IncidentUnassignedEvent;
import com.iitsm.domain.exception.IncidentNotFoundException;
import com.iitsm.domain.exception.TechnicianUnavailableException;
import com.iitsm.domain.exception.UnauthorizedOperationException;
import com.iitsm.domain.factory.IncidentFactory;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.SlaTracking;
import com.iitsm.domain.model.Technician;
import com.iitsm.domain.model.User;
import com.iitsm.domain.observer.IncidentLifecycleSubject;
import com.iitsm.domain.observer.IncidentSubject;
import com.iitsm.domain.strategy.AssignmentStrategy;
import com.iitsm.domain.strategy.PriorityCalculator;
import com.iitsm.domain.strategy.PriorityResult;
import com.iitsm.repository.EmployeeRepository;
import com.iitsm.repository.IncidentCategoryRepository;
import com.iitsm.repository.IncidentRepository;
import com.iitsm.repository.ItServiceRepository;
import com.iitsm.repository.TechnicianRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Core Application Service orchestrating the complete lifecycle of IT incidents.
 * Enforces business workflows, delegates priority calculation and technician assignment
 * to runtime strategies, computes SLA deadlines, and broadcasts Domain Events for auditing
 * and notification decoupled observers.
 */
@Service
@Transactional
public class IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private final IncidentRepository incidentRepository;
    private final EmployeeRepository employeeRepository;
    private final ItServiceRepository itServiceRepository;
    private final IncidentCategoryRepository categoryRepository;
    private final TechnicianRepository technicianRepository;
    private final CategoryService categoryService;
    private final SlaPolicyService slaPolicyService;
    private final PriorityCalculator priorityCalculator;
    private final AssignmentStrategyManager strategyManager;
    private final IncidentFactory incidentFactory;
    private final ApplicationEventPublisher eventPublisher;
    private final com.iitsm.intelligence.DuplicateDetector duplicateDetector;
    private final com.iitsm.intelligence.IncidentCorrelationEngine incidentCorrelationEngine;
    private final IncidentSubject incidentSubject;

    @org.springframework.beans.factory.annotation.Autowired
    public IncidentService(IncidentRepository incidentRepository,
                           EmployeeRepository employeeRepository,
                           ItServiceRepository itServiceRepository,
                           IncidentCategoryRepository categoryRepository,
                           TechnicianRepository technicianRepository,
                           CategoryService categoryService,
                           SlaPolicyService slaPolicyService,
                           PriorityCalculator priorityCalculator,
                           AssignmentStrategyManager strategyManager,
                           IncidentFactory incidentFactory,
                           ApplicationEventPublisher eventPublisher,
                           com.iitsm.intelligence.DuplicateDetector duplicateDetector,
                           com.iitsm.intelligence.IncidentCorrelationEngine incidentCorrelationEngine,
                           IncidentSubject incidentSubject) {
        this.incidentRepository = incidentRepository;
        this.employeeRepository = employeeRepository;
        this.itServiceRepository = itServiceRepository;
        this.categoryRepository = categoryRepository;
        this.technicianRepository = technicianRepository;
        this.categoryService = categoryService;
        this.slaPolicyService = slaPolicyService;
        this.priorityCalculator = priorityCalculator;
        this.strategyManager = strategyManager;
        this.incidentFactory = incidentFactory;
        this.eventPublisher = eventPublisher;
        this.duplicateDetector = duplicateDetector;
        this.incidentCorrelationEngine = incidentCorrelationEngine;
        this.incidentSubject = incidentSubject;
    }

    public IncidentService(IncidentRepository incidentRepository,
                           EmployeeRepository employeeRepository,
                           ItServiceRepository itServiceRepository,
                           IncidentCategoryRepository categoryRepository,
                           TechnicianRepository technicianRepository,
                           CategoryService categoryService,
                           SlaPolicyService slaPolicyService,
                           PriorityCalculator priorityCalculator,
                           AssignmentStrategyManager strategyManager,
                           IncidentFactory incidentFactory,
                           ApplicationEventPublisher eventPublisher,
                           com.iitsm.intelligence.DuplicateDetector duplicateDetector,
                           IncidentSubject incidentSubject) {
        this(incidentRepository, employeeRepository, itServiceRepository, categoryRepository,
                technicianRepository, categoryService, slaPolicyService, priorityCalculator,
                strategyManager, incidentFactory, eventPublisher, duplicateDetector, null, incidentSubject);
    }

    public IncidentService(IncidentRepository incidentRepository,
                           EmployeeRepository employeeRepository,
                           ItServiceRepository itServiceRepository,
                           IncidentCategoryRepository categoryRepository,
                           TechnicianRepository technicianRepository,
                           CategoryService categoryService,
                           SlaPolicyService slaPolicyService,
                           PriorityCalculator priorityCalculator,
                           AssignmentStrategyManager strategyManager,
                           IncidentFactory incidentFactory,
                           ApplicationEventPublisher eventPublisher,
                           com.iitsm.intelligence.DuplicateDetector duplicateDetector) {
        this(incidentRepository, employeeRepository, itServiceRepository, categoryRepository,
                technicianRepository, categoryService, slaPolicyService, priorityCalculator,
                strategyManager, incidentFactory, eventPublisher, duplicateDetector, null, new IncidentLifecycleSubject());
    }

    /**
     * Reports and logs a new incident, executing automated classification, priority calculation,
     * SLA target resolution, and intelligent technician assignment.
     */
    public Incident createIncident(String title, String description, Long reporterId, Long serviceId,
                                   Long explicitCategoryId, Impact impact, Urgency urgency, int affectedUserCount) {
        return createIncident(title, description, reporterId, serviceId, explicitCategoryId, impact, urgency,
                affectedUserCount, null, null, null);
    }

    /**
     * Reports and logs a new incident with optional screenshot / file attachment.
     */
    public Incident createIncident(String title, String description, Long reporterId, Long serviceId,
                                   Long explicitCategoryId, Impact impact, Urgency urgency, int affectedUserCount,
                                   String attachmentName, String attachmentType, String attachmentData) {
        Employee reporter = employeeRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("Reporter employee not found: " + reporterId));
        ItService service = itServiceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Affected IT Service not found: " + serviceId));

        // 1. Factory Pattern: Instantiate Aggregate in initial NEW state
        Incident incident = incidentFactory.createIncident(
                title, description, reporter, service, impact, urgency, affectedUserCount,
                attachmentName, attachmentType, attachmentData
        );

        // 2. Automated / Explicit Categorization
        IncidentCategory category = null;
        if (explicitCategoryId != null) {
            category = categoryRepository.findById(explicitCategoryId).orElse(null);
        }
        if (category == null) {
            category = categoryService.suggestCategory(title + " " + description).orElse(null);
        }
        if (category == null) {
            // Fallback: assign first available category if no keywords matched
            category = categoryRepository.findAll().stream().findFirst().orElse(null);
        }
        if (category != null) {
            incident.classify(category);
        }

        // 3. Strategy Pattern: Calculate Priority
        PriorityResult priorityResult = priorityCalculator.calculate(
                impact, urgency, service.getBusinessCriticality(), affectedUserCount
        );
        incident.setPriority(priorityResult.priority());
        incident.setPriorityScore(priorityResult.score());

        // 4. SLA Policy Resolution & Deadline Calculation
        SlaTracking slaTracking = slaPolicyService.calculateSlaTracking(
                incident.getPriority(), service, LocalDateTime.now()
        );
        incident.setSlaTracking(slaTracking);

        // 5. Strategy Pattern: Automated Technician Assignment
        AssignmentStrategy activeStrategy = strategyManager.getActiveStrategy();
        if (incident.getStatus() == IncidentStatus.CLASSIFIED) {
            List<Technician> candidates = technicianRepository.findEligibleTechnicians();
            Optional<Technician> assignedTech = activeStrategy.assign(incident, candidates);
            assignedTech.ifPresent(tech -> {
                incident.assignTechnician(tech);
                technicianRepository.save(tech);
            });
        }

        // 6. Persistence
        Incident savedIncident = incidentRepository.save(incident);

        // 7. Observer Pattern: Publish Domain Events
        dispatchLifecycleEvent(savedIncident, new IncidentCreatedEvent(
                savedIncident.getId(), savedIncident.getTitle(), reporter.getId(), service.getId(), savedIncident.getPriority()
        ));

        dispatchLifecycleEvent(savedIncident, new IncidentPriorityChangedEvent(
                savedIncident.getId(), Priority.P4, savedIncident.getPriority(),
                savedIncident.getPriorityScore(), priorityResult.rationale()
        ));

        if (savedIncident.getAssignedTechnician() != null) {
            dispatchLifecycleEvent(savedIncident, new IncidentAssignedEvent(
                    savedIncident.getId(), savedIncident.getAssignedTechnician().getId(),
                    savedIncident.getAssignedTechnician().getFullName(), activeStrategy.getName()
            ));
        }

        // 8. Intelligent Features: Correlated Outages & Duplicate Incident Detection
        if (duplicateDetector != null) {
            duplicateDetector.detectAndLinkDuplicates(savedIncident);
        }
        if (incidentCorrelationEngine != null) {
            incidentCorrelationEngine.correlateAndLink(savedIncident);
        }

        log.info("Created Incident INC-{} with Priority {} and Status {}",
                savedIncident.getId(), savedIncident.getPriority(), savedIncident.getStatus());

        return savedIncident;
    }

    /**
     * Manually classifies or re-classifies an incident.
     */
    public Incident classifyIncident(Long incidentId, Long categoryId, Long actorUserId) {
        Incident incident = getIncidentById(incidentId);
        IncidentCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId));

        IncidentStatus prev = incident.getStatus();
        incident.classify(category);
        Incident saved = incidentRepository.save(incident);

        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), actorUserId, "Classified as " + category.getName()
        ));
        return saved;
    }

    /**
     * Assigns or reassigns a primary support technician.
     * If technicianId is null, unassigns the technician completely.
     */
    public Incident assignTechnician(Long incidentId, Long technicianId, Long actorUserId) {
        if (technicianId == null) {
            return unassignTechnician(incidentId, actorUserId);
        }

        Incident incident = getIncidentById(incidentId);
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found: " + technicianId));

        if (!technician.isAvailable()) {
            throw new TechnicianUnavailableException(technicianId);
        }

        Technician oldTechnician = incident.getAssignedTechnician();
        if (oldTechnician != null && oldTechnician.equals(technician)) {
            return incident;
        }

        IncidentStatus prev = incident.getStatus();
        incident.assignTechnician(technician);
        technicianRepository.save(technician);
        if (oldTechnician != null && !oldTechnician.equals(technician)) {
            technicianRepository.save(oldTechnician);
        }
        Incident saved = incidentRepository.save(incident);

        String assignType = oldTechnician != null ? "MANUAL_REASSIGNMENT" : "MANUAL_ASSIGNMENT";
        dispatchLifecycleEvent(saved, new IncidentAssignedEvent(
                saved.getId(), technician.getId(), technician.getFullName(), assignType
        ));
        String note = oldTechnician != null
                ? "Reassigned from " + oldTechnician.getFullName() + " to " + technician.getFullName()
                : "Assigned to " + technician.getFullName();
        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), actorUserId, note
        ));
        return saved;
    }

    /**
     * Completely unassigns the primary support technician from an incident,
     * decrementing technician workload, releasing the ticket, and resetting status to CLASSIFIED.
     */
    public Incident unassignTechnician(Long incidentId, Long actorUserId) {
        Incident incident = getIncidentById(incidentId);
        Technician oldTechnician = incident.getAssignedTechnician();
        if (oldTechnician == null) {
            return incident;
        }

        if (!incident.getStatus().isOpen()) {
            throw new IllegalStateException("Cannot unassign a resolved or closed incident.");
        }

        IncidentStatus prev = incident.getStatus();
        incident.unassignTechnician();
        technicianRepository.save(oldTechnician);
        Incident saved = incidentRepository.save(incident);

        dispatchLifecycleEvent(saved, new IncidentUnassignedEvent(
                saved.getId(), oldTechnician.getId(), oldTechnician.getFullName()
        ));
        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), actorUserId,
                "Unassigned technician " + oldTechnician.getFullName() + ". Ticket returned to unassigned queue."
        ));
        return saved;
    }

    /**
     * Technician acknowledges assignment, stopping response SLA clock.
     */
    public Incident acknowledgeIncident(Long incidentId, Long technicianUserId) {
        Incident incident = getIncidentById(incidentId);
        validateAssignedTechnician(incident, technicianUserId);

        IncidentStatus prev = incident.getStatus();
        incident.acknowledge();
        Incident saved = incidentRepository.save(incident);

        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), technicianUserId, "Technician acknowledged incident"
        ));
        return saved;
    }

    /**
     * Moves incident to IN_PROGRESS active investigation.
     * If incident is in ASSIGNED status, it is automatically acknowledged first.
     */
    public Incident startInvestigation(Long incidentId, Long technicianUserId) {
        Incident incident = getIncidentById(incidentId);
        validateAssignedTechnician(incident, technicianUserId);

        if (incident.getStatus() == IncidentStatus.ASSIGNED) {
            incident.acknowledge();
        }

        IncidentStatus prev = incident.getStatus();
        incident.startInvestigation();
        Incident saved = incidentRepository.save(incident);

        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), technicianUserId, "Investigation started"
        ));
        return saved;
    }

    /**
     * Appends a diagnostic investigation note to the incident.
     */
    @Transactional
    public Incident addInvestigationNote(Long incidentId, User author, String content) {
        return addInvestigationNote(incidentId, author, content, null, null, null);
    }

    /**
     * Appends a diagnostic investigation note with optional file / screenshot attachment.
     */
    @Transactional
    public Incident addInvestigationNote(Long incidentId, User author, String content,
                                         String attachmentName, String attachmentType, String attachmentData) {
        Incident incident = getIncidentById(incidentId);
        incident.addNote(author, content, attachmentName, attachmentType, attachmentData);
        Incident saved = incidentRepository.save(incident);
        if (saved.getNotes() != null) saved.getNotes().size();
        return saved;
    }

    /**
     * Marks the incident as RESOLVED, with optional tandem resolution of correlated tickets (cutoff: >= 85% match).
     */
    public Incident resolveIncident(Long incidentId, Long technicianUserId,
                                    String summary, String rootCause, String steps,
                                    List<Long> correlatedIncidentIds) {
        Incident incident = getIncidentById(incidentId);
        validateAssignedTechnician(incident, technicianUserId);

        IncidentStatus prev = incident.getStatus();
        // Safely advance primary incident to IN_PROGRESS if currently in earlier open state
        advanceToInProgress(incident, incident.getAssignedTechnician());

        incident.resolve(technicianUserId, summary, rootCause, steps);

        if (incident.getAssignedTechnician() != null) {
            technicianRepository.save(incident.getAssignedTechnician());
        }

        Incident saved = incidentRepository.save(incident);

        dispatchLifecycleEvent(saved, new IncidentResolvedEvent(saved.getId(), technicianUserId, summary));
        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), technicianUserId, "Incident resolved: " + summary
        ));

        // Tandem Resolution of Correlated Incidents with >= 85% match cutoff
        if (correlatedIncidentIds != null && !correlatedIncidentIds.isEmpty()) {
            Technician resolvingTech = technicianRepository.findById(technicianUserId).orElse(null);
            User author = resolvingTech != null
                    ? (User) resolvingTech
                    : employeeRepository.findById(technicianUserId).map(e -> (User) e)
                    .orElseGet(() -> saved.getAssignedTechnician() != null ? (User) saved.getAssignedTechnician() : (User) saved.getReporter());

            for (Long corrId : correlatedIncidentIds) {
                if (Objects.equals(corrId, incidentId)) {
                    continue; // Skip self
                }
                incidentRepository.findById(corrId).ifPresent(corr -> {
                    if (corr.getStatus().isOpen()) {
                        // Strict cutoff: only group if match is 85% (0.85) or above
                        if (incidentCorrelationEngine != null) {
                            com.iitsm.intelligence.IncidentCorrelationEngine.CorrelationResult corrResult = incidentCorrelationEngine.evaluateCorrelation(saved, corr);
                            double duplicateScore = duplicateDetector != null
                                    ? duplicateDetector.findDuplicates(saved, 0.0).stream()
                                            .filter(d -> Objects.equals(d.incidentId(), corr.getId()))
                                            .mapToDouble(com.iitsm.intelligence.DuplicateMatch::similarityScore)
                                            .findFirst().orElse(0.0)
                                    : 0.0;
                            double bestMatch = Math.max(corrResult.score(), duplicateScore);
                            if (bestMatch < 0.85) {
                                log.warn("Skipping tandem resolution for incident #{} with primary #{} - match score {} is below 85% cutoff",
                                        corrId, incidentId, bestMatch);
                                return;
                            }
                        }

                        IncidentStatus corrPrev = corr.getStatus();

                        // Safely advance through state transitions to IN_PROGRESS
                        advanceToInProgress(corr, resolvingTech != null ? resolvingTech : saved.getAssignedTechnician());

                        String corrSummary = summary + " (Resolved via correlated incident INC-" + incidentId + ")";
                        String corrSteps = steps + " [Remediated in tandem with INC-" + incidentId + "]";

                        corr.resolve(technicianUserId, corrSummary, rootCause, corrSteps);

                        // Ensure bidirectional linking in domain model
                        saved.linkRelatedIncident(corr);
                        corr.linkRelatedIncident(saved);

                        // If correlated incident had an assigned technician, decrement and persist their workload
                        if (corr.getAssignedTechnician() != null) {
                            technicianRepository.save(corr.getAssignedTechnician());
                        }

                        if (author != null) {
                            corr.addNote(author, "Correlated Resolution: Automatically resolved in tandem with primary incident INC-"
                                    + incidentId + " (Identified Root Cause: " + rootCause + ")");
                        }

                        Incident savedCorr = incidentRepository.save(corr);

                        dispatchLifecycleEvent(savedCorr, new IncidentResolvedEvent(savedCorr.getId(), technicianUserId, corrSummary));
                        dispatchLifecycleEvent(savedCorr, new IncidentStatusChangedEvent(
                                savedCorr.getId(), corrPrev, savedCorr.getStatus(), technicianUserId,
                                "Correlated incident resolved via INC-" + incidentId + ": " + corrSummary
                        ));

                        log.info("Correlated incident #{} automatically resolved in tandem with primary incident #{}",
                                corr.getId(), incidentId);
                    }
                });
            }
            incidentRepository.save(saved);
        }

        return saved;
    }

    public Incident resolveIncident(Long incidentId, Long technicianUserId,
                                    String summary, String rootCause, String steps) {
        return resolveIncident(incidentId, technicianUserId, summary, rootCause, steps, null);
    }

    /**
     * Batch resolves multiple incidents reporting the same root issue.
     */
    public List<Incident> batchResolveIncidents(List<Long> incidentIds, Long resolvingUserId,
                                                String summary, String rootCause, String steps) {
        if (incidentIds == null || incidentIds.isEmpty()) {
            return List.of();
        }

        List<Incident> resolvedList = new java.util.ArrayList<>();
        Technician resolvingTech = technicianRepository.findById(resolvingUserId).orElse(null);
        User author = resolvingTech != null
                ? (User) resolvingTech
                : employeeRepository.findById(resolvingUserId).map(e -> (User) e)
                .orElse(null);

        for (Long id : incidentIds) {
            incidentRepository.findById(id).ifPresent(incident -> {
                if (incident.getStatus().isOpen()) {
                    IncidentStatus prev = incident.getStatus();
                    advanceToInProgress(incident, resolvingTech);

                    incident.resolve(resolvingUserId, summary, rootCause, steps);

                    if (incident.getAssignedTechnician() != null) {
                        technicianRepository.save(incident.getAssignedTechnician());
                    }

                    if (author != null) {
                        incident.addNote(author, "Batch Resolution: Remediated as part of outage cluster (Root Cause: " + rootCause + ")");
                    }

                    Incident saved = incidentRepository.save(incident);
                    dispatchLifecycleEvent(saved, new IncidentResolvedEvent(saved.getId(), resolvingUserId, summary));
                    dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                            saved.getId(), prev, saved.getStatus(), resolvingUserId, "Batch resolved: " + summary
                    ));
                    resolvedList.add(saved);
                }
            });
        }
        return resolvedList;
    }

    /**
     * Safely advances an open incident through the ITIL lifecycle states to IN_PROGRESS so it can be resolved.
     */
    private void advanceToInProgress(Incident incident, Technician defaultTechnician) {
        if (!incident.getStatus().isOpen() || incident.getStatus() == IncidentStatus.IN_PROGRESS) {
            return;
        }

        if (incident.getStatus() == IncidentStatus.NEW) {
            if (incident.getCategory() == null) {
                categoryRepository.findAll().stream().findFirst().ifPresent(incident::classify);
            } else {
                incident.classify(incident.getCategory());
            }
        }

        if (incident.getStatus() == IncidentStatus.CLASSIFIED) {
            Technician tech = incident.getAssignedTechnician() != null ? incident.getAssignedTechnician() : defaultTechnician;
            if (tech == null) {
                tech = technicianRepository.findAll().stream().findFirst().orElse(null);
            }
            if (tech != null) {
                incident.assignTechnician(tech);
            }
        }

        if (incident.getStatus() == IncidentStatus.ASSIGNED) {
            incident.acknowledge();
        }

        if (incident.getStatus() == IncidentStatus.ACKNOWLEDGED) {
            incident.startInvestigation();
        }
    }

    /**
     * Confirms that resolution successfully restored service operations.
     */
    public Incident verifyIncident(Long incidentId, Long verifyingUserId) {
        Incident incident = getIncidentById(incidentId);
        IncidentStatus prev = incident.getStatus();
        incident.verify();
        Incident saved = incidentRepository.save(incident);

        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), verifyingUserId, "Resolution verified"
        ));
        return saved;
    }

    /**
     * Formally closes the incident.
     */
    public Incident closeIncident(Long incidentId, Long closingUserId) {
        Incident incident = getIncidentById(incidentId);
        IncidentStatus prev = incident.getStatus();
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            incident.verify(); // Auto-verify resolution on administrative formal closure
        }
        incident.close();
        Incident saved = incidentRepository.save(incident);

        dispatchLifecycleEvent(saved, new IncidentClosedEvent(saved.getId(), closingUserId));
        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), closingUserId, "Incident closed"
        ));
        return saved;
    }

    /**
     * Reopens a resolved or closed incident if issues recur.
     */
    public Incident reopenIncident(Long incidentId, Long actorUserId, String reason) {
        Incident incident = getIncidentById(incidentId);
        IncidentStatus prev = incident.getStatus();
        incident.reopen(reason);
        if (incident.getAssignedTechnician() != null) {
            incident.getAssignedTechnician().incrementWorkload();
            technicianRepository.save(incident.getAssignedTechnician());
        }
        Incident saved = incidentRepository.save(incident);

        dispatchLifecycleEvent(saved, new IncidentStatusChangedEvent(
                saved.getId(), prev, saved.getStatus(), actorUserId, "Reopened: " + reason
        ));
        return saved;
    }

    private void dispatchLifecycleEvent(Incident incident, DomainEvent event) {
        if (incidentSubject != null) {
            incidentSubject.notifyObservers(incident, event);
        }
        eventPublisher.publishEvent(event);
    }

    /**
     * Submits user satisfaction rating and review.
     */
    public Incident submitFeedback(Long incidentId, Long reporterUserId, int rating, String comment) {
        Incident incident = getIncidentById(incidentId);
        if (!Objects.equals(incident.getReporter().getId(), reporterUserId)) {
            throw new UnauthorizedOperationException("Only the incident reporter can submit feedback");
        }
        incident.submitFeedback(rating, comment);
        return incidentRepository.save(incident);
    }

    @Transactional(readOnly = true)
    public Incident getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IncidentNotFoundException(id));
        if (incident.getNotes() != null) incident.getNotes().size();
        if (incident.getRelatedIncidents() != null) incident.getRelatedIncidents().size();
        return incident;
    }

    @Transactional(readOnly = true)
    public List<Incident> findMyReportedIncidents(Employee reporter) {
        return incidentRepository.findByReporterOrderByCreatedAtDesc(reporter);
    }

    @Transactional(readOnly = true)
    public List<Incident> findMyAssignedIncidents(Technician technician) {
        return incidentRepository.findByAssignedTechnicianOrderByCreatedAtDesc(technician);
    }

    @Transactional(readOnly = true)
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Incident> searchIncidents(
            String search,
            IncidentStatus status,
            Priority priority,
            Long categoryId,
            Long serviceId,
            Long technicianId,
            Long reporterId,
            SlaStatus slaStatus,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            org.springframework.data.domain.Pageable pageable) {

        org.springframework.data.jpa.domain.Specification<Incident> spec =
                com.iitsm.repository.specification.IncidentSpecification.filter(
                        search, status, priority, categoryId, serviceId, technicianId, reporterId, slaStatus, fromDate, toDate
                );
        return incidentRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public com.iitsm.intelligence.IncidentCorrelationReport getIncidentCorrelations(Long incidentId) {
        Incident incident = getIncidentById(incidentId);
        if (incidentCorrelationEngine != null) {
            return incidentCorrelationEngine.analyzeCorrelations(incident);
        }
        return new com.iitsm.intelligence.IncidentCorrelationReport(
                incidentId,
                incident.getAffectedService() != null ? incident.getAffectedService().getName() : "Unknown",
                0,
                incident.getAffectedUserCount(),
                1,
                "None",
                incident.getPriority(),
                List.of()
        );
    }

    @Transactional(readOnly = true)
    public List<com.iitsm.intelligence.OutageCluster> getActiveOutageClusters() {
        if (incidentCorrelationEngine != null) {
            return incidentCorrelationEngine.detectAllActiveClusters();
        }
        return List.of();
    }

    private void validateAssignedTechnician(Incident incident, Long technicianUserId) {
        if (incident.getAssignedTechnician() == null) {
            // Auto-assign the resolving user if they are an active technician
            technicianRepository.findById(technicianUserId).ifPresent(incident::assignTechnician);
            return;
        }
        if (!Objects.equals(incident.getAssignedTechnician().getId(), technicianUserId)) {
            // Permit if caller has administrative privileges
            boolean isAdmin = employeeRepository.findById(technicianUserId)
                    .map(u -> u.getRole() == com.iitsm.domain.enums.Role.ADMIN)
                    .orElse(false);
            if (!isAdmin) {
                throw new UnauthorizedOperationException("Only the assigned technician may perform this action");
            }
        }
    }
}
