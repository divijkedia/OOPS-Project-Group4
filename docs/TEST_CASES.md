# Resolvo Automated Test Suite Specification

> **Total Tests**: 92 passing automated tests
> **Framework**: JUnit 5, Mockito, Spring Boot Test, Spring Security Test, MockMvc
> **Target**: 0 failures, 0 errors, 0 skipped (100% Success)

---

## 1. Test Summary by Domain Component

| Component / Layer | Test Class | Test Count | Focus |
|---|---|---|---|
| **State Pattern** | `IncidentStateTransitionTest` | 12 | State transition rules, illegal transition rejection, feedback gates, verification |
| **Strategy Pattern** | `WeightedPriorityCalculatorTest` | 4 | Priority formula, boundary scores, affected user bonus |
| **Strategy Pattern** | `SkillBasedAssignmentTest` | 3 | Skill matching, experience ranking, workload filtering |
| **Strategy Pattern** | `LoadBasedAssignmentTest` | 3 | Least-loaded min-heap, tie breaking, full capacity rejection |
| **Strategy Pattern** | `RoundRobinAssignmentTest` | 1 | Cyclic rotation using AtomicInteger |
| **Strategy Pattern** | `AssignmentStrategyManagerTest` | 3 | Runtime strategy lookup, dynamic strategy switching, unknown strategy error |
| **Factory Pattern** | `UserFactoryTest` | 3 | Polymorphic creation of Employee, Technician, Administrator |
| **Application Services** | `IncidentServiceTest` | 11 | End-to-end incident orchestration, tandem group resolution with >=85% cutoff, authorization, feedback submission |
| **SLA Monitoring** | `SlaMonitorServiceTest` | 3 | Warning threshold at 80% window, breach detection, on-track status |
| **Observer Pattern** | `AuditEventListenerTest` | 4 | Creation, status changes, assignments, and SLA violation audit trail recording |
| **Observer Pattern** | `NotificationEventListenerTest` | 4 | Dual-channel (`IN_APP`, `EMAIL`) notification dispatches on lifecycle events |
| **Intelligence** | `IncidentCorrelationEngineTest` | 7 | Cross-service infrastructure dependency mapping, blast radius calculation, root cause clustering |
| **Intelligence** | `DuplicateDetectorTest` | 4 | Jaccard similarity calculation, stop word stripping, service duplication auto-linking |
| **Intelligence** | `SmartTechnicianRecommenderTest` | 1 | Multi-factor weighted technician ranking (skills 50%, capacity 30%, experience 20%) |
| **Intelligence** | `AutoEscalationServiceTest` | 4 | Multi-tier escalation ladder (TECHNICIAN -> TEAM_LEAD -> IT_MANAGER -> SYSTEM_ADMINISTRATOR) |
| **Reporting** | `ReportServiceTest` | 3 | Executive overview metrics, workload utilization, service incident distribution |
| **Security & Auth** | `AuthControllerIntegrationTest` | 3 | Seeded login with JWT bearer token, invalid password rejection, employee registration |
| **Security & RBAC** | `SecurityAuthorizationIntegrationTest` | 11 | Role-based 403 Forbidden enforcement on Admin, Tech, and Employee endpoints |
| **REST API** | `IncidentControllerIntegrationTest` | 2 | End-to-end incident report creation, role-filtered listing |
| **REST API** | `IncidentSearchIntegrationTest` | 8 | Multi-criteria Specification filtering (keyword, priority, service, pagination & sort) |
| **REST API** | `ReportControllerIntegrationTest` | 4 | Overview dashboard, technician workloads, service reports, and RBAC rejection |
| **Infrastructure** | `IitsmApplicationTests` | 1 | Full Spring Boot context bootstrap & Flyway migration verification |
| **Total** | **22 Test Classes** | **92 Tests** | **100% Passing** |

---

## 2. Exhaustive Test Catalog

### 2.1 State Pattern Tests (`IncidentStateTransitionTest`)
1. `shouldAllowNewToClassified`: Verifies transition from `NEW` to `CLASSIFIED`.
2. `shouldRejectNewToClosed`: Asserts `InvalidStateTransitionException` when attempting illegal skip from `NEW` directly to `CLOSED`.
3. `shouldRejectAssignedToResolved`: Asserts `InvalidStateTransitionException` when attempting to resolve an assigned incident without investigating.
4. `shouldAllowClosedToReopened`: Validates re-opening workflow for recurring incidents.
5. `shouldPreventFeedbackBeforeResolution`: Guards feedback submission from premature execution on unresolved tickets.
6. `shouldAllowFeedbackOnResolvedIncident`: Verifies satisfaction rating storage on remediated tickets.

### 2.2 Priority Calculation Tests (`WeightedPriorityCalculatorTest`)
7. `shouldReturnP1ForMaxScores`: Critical Impact x Critical Urgency x Critical Criticality = 64 -> $P1$.
8. `shouldReturnP4ForMinScores`: Low Impact x Low Urgency x Low Criticality = 1 -> $P4$.
9. `shouldBoostPriorityForHighAffectedUsers`: 101 affected users adds $+10$ bonus, pushing Medium into High priority tier.
10. `shouldMapScoreRangesToCorrectPriorities`: Validates boundary threshold mappings ($P1 \ge 48$, $P2 \ge 18$, $P3 \ge 6$, $P4 < 6$).

### 2.3 Assignment Strategy Tests
11. `shouldAssignTechnicianWithMatchingSkill`: Selects technician whose skills match incident category.
12. `shouldPreferHigherExperienceOnSkillMatch`: Picks Senior over Junior technician when both have matching skills.
13. `shouldSkipTechnicianAtMaxWorkload`: Bypasses fully loaded technicians even if skills match.
14. `shouldAssignLeastBusyTechnician`: Picks technician with lowest active ticket count using min-heap.
15. `shouldBreakLoadTieWithSeniority`: Breaks active workload ties by picking the more experienced candidate.
16. `shouldReturnEmptyWhenAllAtMaxWorkload`: Returns `Optional.empty()` when entire team is at capacity.
17. `shouldDistributeCyclically`: Verifies round-robin modulo rotation.
18. `shouldDefaultToSkillBasedStrategy`: Initial strategy defaults to `SKILL_BASED`.
19. `shouldSwitchStrategyAtRuntime`: Dynamically changes active strategy to `LOAD_BASED` via manager.
20. `shouldThrowExceptionForUnknownStrategy`: Rejects invalid strategy name with descriptive error.

### 2.4 Application & Intelligence Service Tests
21. `shouldCreateIncidentWithAutomatedClassificationPriorityAndAssignment`: Full end-to-end service pipeline test.
22. `shouldResolveIncidentAndFreeTechnicianWorkload`: Verifies technician active incident count decrements on resolution.
23. `shouldPreventNonAssignedTechnicianFromResolving`: Enforces authorization check preventing unauthorized technicians from resolving others' tickets.
24. `shouldSubmitFeedbackSuccessfully`: Verifies user satisfaction rating and review comments.
25. `shouldResolveIncidentAlongWithCorrelatedIncidents`: Validates tandem resolution of open correlated tickets when match $\ge 85\%$.
26. `shouldSkipTandemResolutionIfCorrelationScoreIsBelow85Percent`: Enforces strict threshold guard skipping tandem resolution when correlation match $< 85\%$.
27. `shouldDetectApproachingDeadline`: Evaluates SLA window at 85% elapsed time, updates status to `APPROACHING`, fires `SlaApproachingEvent`.
28. `shouldDetectViolatedDeadline`: Evaluates expired deadline, updates status to `VIOLATED`, fires `SlaViolatedEvent`.
29. `shouldLeaveIncidentOnTrackWhenWithinWindow`: Verifies no breach or warning when evaluated well within window (<80%).
30. `shouldRecordAuditOnIncidentCreated`: Verifies audit entry creation on incident log.
31. `shouldRecordAuditOnIncidentStatusChanged`: Verifies audit state history recording.
32. `shouldRecordAuditOnSlaViolated`: Verifies system audit record on SLA breaches.
33. `shouldDispatchNotificationsOnIncidentCreated`: Asserts `IN_APP` and `EMAIL` dispatches to reporter.
34. `shouldDispatchNotificationsOnIncidentAssigned`: Asserts `IN_APP` and `EMAIL` dispatches to technician.
35. `shouldDispatchAlertsOnSlaViolated`: Asserts critical alerts to technician and all administrators.
36. `shouldDetectSimilarDescriptions`: Validates Jaccard similarity $\ge 0.40$ on correlated incident text.
37. `shouldNotFlagDissimilarDescriptions`: Validates Jaccard similarity $< 0.20$ on disparate issues.
38. `shouldTokenizeAndFilterStopWords`: Validates NLP tokenization and stop word filtering.
39. `shouldDetectAndLinkDuplicatesOnSameService`: Verifies bidirectional linking of duplicate incidents.
40. `shouldRankByMultipleFactors`: Verifies multi-factor technician recommendation scoring.
41. `shouldEscalateUnacknowledgedIncidentAcrossTiers`: Verifies multi-tier escalation from `TECHNICIAN` to `TEAM_LEAD` to `IT_MANAGER` to `SYSTEM_ADMINISTRATOR`.
42. `shouldUnassignTechnicianSafely`: Verifies returning ticket to `CLASSIFIED` and atomic workload decrement.

### 2.5 REST Integration & Security Tests
39. `shouldLoginSuccessfully`: Authenticates seeded admin with BCrypt `password123` and returns JWT token.
40. `shouldRejectInvalidPassword`: Rejects incorrect passwords with 401 Unauthorized.
41. `shouldRegisterNewUser`: Creates employee user and verifies 201 Created.
42. `shouldCreateIncidentEndToEnd`: Exercises HTTP POST `/api/incidents`, auto-classification, SLA calculation.
43. `shouldListIncidentsForEmployee`: Exercises role-scoped listing for employees.
44. `shouldAllowAdminAccessToAdminEndpoint`: Validates 200 OK for ADMIN role on `/api/admin/services`.
45. `shouldRejectEmployeeFromAdminEndpoint`: Validates 403 Forbidden for EMPLOYEE role on `/api/admin/**`.
46. `shouldRejectUnauthenticatedUser`: Validates 401 Unauthorized for requests lacking JWT token.
47. `shouldAllowTechnicianAccessToTechnicianEndpoint`: Validates 200 OK for TECHNICIAN role on `/api/technician/queue`.
48. `shouldFilterByKeyword`: Tests dynamic keyword search via Specification.
49. `shouldFilterByPriority`: Tests priority filtering on `/api/incidents?priority=P1`.
50. `shouldFilterByService`: Tests service filtering on `/api/incidents?serviceId=1`.
51. `shouldPaginateAndSortIncidents`: Tests pagination and sorting parameters.
52. `shouldGetOverviewReportAsAdmin`: Validates executive dashboard JSON metrics.
53. `shouldGetTechnicianReportAsAdmin`: Validates technician capacity utilization list.
54. `shouldGetServiceReportAsAdmin`: Validates service reliability analysis list.
55. `shouldRejectEmployeeForTechnicianReport`: Enforces 403 Forbidden on report access for non-admins.
56. `shouldGenerateOverviewReport`: Validates reporting calculations and SLA compliance percentage.
57. `shouldGenerateTechnicianWorkloadReport`: Validates workload percentage math per technician.
58. `shouldGenerateServiceAnalysisReport`: Validates service grouping and breach counting.
59. `shouldCreateEmployeeSuccessfully`: UserFactory test for employee instantiation.
60. `shouldCreateTechnicianSuccessfully`: UserFactory test for technician instantiation.
61. `shouldCreateAdministratorSuccessfully`: UserFactory test for admin instantiation.
62. `contextLoads`: Verifies Spring Boot application context and Flyway schema execution.
