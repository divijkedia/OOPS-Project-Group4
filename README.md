# Resolvo: Intelligent IT Service Management & Incident Resolution System: Backend

[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Build & Tests](https://img.shields.io/badge/Tests-92%20Passed%20(100%25)-success.svg)](docs/TEST_CASES.md)
[![Database](https://img.shields.io/badge/Database-H2%20%7C%20PostgreSQL-blue.svg)](docs/ARCHITECTURE.md)
[![Design Patterns](https://img.shields.io/badge/Design%20Patterns-6%20Implemented-blueviolet.svg)](docs/DESIGN_DECISIONS.md)

An industry-grade, production-ready backend service managing the full IT incident lifecycle:
**Report -> Auto-Classify -> Dynamic Prioritize -> Intelligent Assign -> Investigate -> Resolve -> Verify -> Close**.

Built strictly in **Java 21** as an Object-Oriented Programming (OOP) master course project demonstrating rigorous software engineering: clean encapsulation (zero Lombok magic), clear inheritance hierarchies, sealed state transitions, pluggable algorithmic strategies, reactive domain event dispatching, and multi-factor intelligent recommendation heuristics.

---

## Table of Contents

1. [Architectural Highlights](#architectural-highlights)
2. [OOP Core Principles Mapping](#oop-core-principles-mapping)
3. [Design Patterns Implemented](#design-patterns-implemented)
4. [Prerequisites & Build Tools](#prerequisites--build-tools)
5. [Quick Start](#quick-start)
6. [Interactive API & Database Consoles](#interactive-api--database-consoles)
7. [Seeded User Credentials & RBAC Matrix](#seeded-user-credentials--rbac-matrix)
8. [End-to-End API Walkthrough (cURL)](#end-to-end-api-walkthrough-curl)
9. [Automated Test Suite](#automated-test-suite)
10. [Documentation Index](#documentation-index)
11. [Academic Viva Defense Checklist](#academic-viva-defense-checklist)

---

## Architectural Highlights

The system adheres to a strict **4-tier layered architecture** with explicit boundaries:

```
[ HTTP REST Clients / Swagger UI ]
               |
               v
   [ Presentation Layer ]          --> Controllers, Request/Response DTOs, Mappers, GlobalExceptionHandler
               |
               v
   [ Application Layer ]           --> Application Services, SlaMonitorService, Event Listeners, Heuristics
               |
               v
   [ Domain Model Layer ]          --> Entities, Sealed State Pattern, Strategy Interfaces, Value Objects
               |
               v
   [ Infrastructure Layer ]        --> Spring Data JPA Repositories, Specifications, Flyway, H2 / PostgreSQL
```

- **Domain-Driven Encapsulation**: Domain models protect their internal invariants. State transitions and SLA computations occur within the domain entities, not in anemic controllers.
- **Pluggable Heuristics**: Assignment strategies, similarity matching, and technician recommendations are encapsulated behind clean strategy interfaces.
- **Decoupled Event Architecture**: The incident lifecycle emits domain events processed asynchronously or detached by specialized listeners (`AuditEventListener`, `NotificationEventListener`).
- **Zero Lombok Magic**: All constructors, explicit getters, defensive copies, and domain validations are written by hand, allowing students to explain every byte in an academic viva.

---

## OOP Core Principles Mapping

| OOP Principle | Concrete Implementation in Resolvo |
|---|---|
| **Encapsulation** | `User`, `Incident`, and `Technician` maintain private fields with validated getters/setters. `Incident.java` prevents invalid direct field mutation; transitions happen through `transitionTo(nextState)`. Password hashes and credentials never leak into response DTOs. |
| **Abstraction** | Strategy contracts `TechnicianAssignmentStrategy`, `NotificationService`, and `AutoEscalationService` abstract complex assignment, communication, and escalation algorithms behind clean method signatures. |
| **Inheritance** | Single-table inheritance on `User` entity (`@Inheritance(strategy = SINGLE_TABLE)` with `@DiscriminatorColumn("role")`), extending into `Employee`, `Technician`, and `Administrator`. Specialized fields (e.g., `specialization`, `maxConcurrentIncidents`, `activeIncidentsCount` on `Technician`) are inherited cleanly. |
| **Polymorphism** | Runtime polymorphic assignment dispatch via `TechnicianAssignmentStrategy` (`RoundRobinStrategy`, `WorkloadAwareStrategy`, `ExpertiseMatchingStrategy`). Polymorphic event handling via `DomainEvent` hierarchy (`IncidentCreatedEvent`, `IncidentStatusChangedEvent`, `SlaBreachedEvent`). |
| **Composition** | `Incident` owns its `SlaTracking` lifecycle entity (`@OneToOne(cascade = ALL, orphanRemoval = true)`). Deleting an incident cleans up its SLA metrics and deadline trackers. |
| **Aggregation** | `Incident` references existing `ItService`, `User` (reporter), and `Technician` (assignee) via `@ManyToOne`. Those entities exist independently of any individual incident. |
| **Association** | Bidirectional association between `Incident` and `IncidentComment` (`@OneToMany` mapped by `incident`), and self-referential association for duplicate linking via `related_incidents`. |

---

## Design Patterns Implemented

| Design Pattern | Category | Concrete Implementation | Purpose & Viva Justification |
|---|---|---|---|
| **State Pattern** | Behavioral | `IncidentState` (interface) & 7 concrete states (`ReportedState`, `AssignedState`, `InProgressState`, `ResolvedState`, `ClosedState`, etc.) | Eliminates giant, error-prone `switch/case` statements. Enforces the strict incident lifecycle state machine (`REPORTED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED`). Invalid transitions throw `InvalidStateTransitionException`. |
| **Strategy Pattern** | Behavioral | `TechnicianAssignmentStrategy` with `RoundRobinStrategy`, `WorkloadAwareStrategy`, and `ExpertiseMatchingStrategy` | Allows dynamic, runtime swapping of technician assignment algorithms based on system configuration or incident urgency without modifying client code. |
| **Observer Pattern** | Behavioral | Spring Event Publisher & Listeners (`AuditEventListener`, `NotificationEventListener`) | Decouples the core incident service from side-effects. Emits `DomainEvent` instances; listeners handle multi-channel notification dispatch (`IN_APP`, `EMAIL`) and write immutable audit records. |
| **Factory Pattern** | Creational | `NotificationServiceFactory` and `IncidentFactory` | Encapsulates the instantiation logic of complex notification handlers (`InAppNotificationService`, `EmailNotificationService`) and incident entities with baseline SLA calculations. |
| **Repository Pattern** | Architectural | Spring Data JPA Repositories (`IncidentRepository`, `UserRepository`, `AuditRecordRepository`) with `IncidentSpecification` | Decouples business logic from persistence technologies, providing type-safe dynamic multi-criteria database querying. |
| **Adapter Pattern** | Structural | `UserDetailsAdapter` | Bridges our domain `User` entity to Spring Security's `UserDetails` contract without polluting the domain class with framework-specific annotations. |

---

## Prerequisites & Build Tools

- **Java Development Kit (JDK)**: **Java 21 (LTS)** required (e.g., Eclipse Temurin, Oracle JDK, or OpenJDK).
- **Node.js**: **Node.js 18+** and npm for the React web portal.
- **Build Tool**: Apache Maven 3.9+ (cross-platform Maven wrapper provided: `mvnw.cmd` on Windows, `./mvnw` on Linux/macOS).
- **Database**:
  - `dev` profile (default): In-memory **H2** with PostgreSQL compatibility mode and web console.
  - `test` profile: Dedicated in-memory **H2** instance for automated tests.
  - `prod` profile: Targets standalone **PostgreSQL 15+**.

---

## Quick Start

### 1. Build and Run All Tests
```bash
# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```
*Expected: 93 tests run, 0 failures, 0 errors, 100% success.*

### 2. Run the Application (Dev Profile)
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```
The server starts on port **`8080`** using the `dev` profile with Flyway migrations automatically executed.

---

## Interactive API & Database Consoles

Once the server is running:

| Resource | URL | Details / Credentials |
|---|---|---|
| **Swagger UI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Interactive OpenAPI 3.0 explorer with Try-it-out capabilities |
| **OpenAPI Docs** | [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs) | Machine-readable OpenAPI JSON schema |
| **H2 Web Console** | [http://localhost:8080/h2-console](http://localhost:8080/h2-console) | **JDBC URL**: `jdbc:h2:mem:iitsm_dev`<br>**User**: `sa`<br>**Password**: *(leave blank)* |

---

## Seeded User Credentials & RBAC Matrix

All pre-seeded test accounts use the default password: **`password123`**

| Username | Role | Full Name | Department / Specialization | Accessible Capabilities |
|---|---|---|---|---|
| `admin` | **ADMIN** | System Administrator | IT Operations & Governance | Full system control: SLA overrides, manual re-assignment, global reports, strategy switching |
| `it_manager` | **ADMIN** | IT Operations Manager | IT Management | Analytics, audit trails, technician capacity monitoring |
| `tech_alice` | **TECHNICIAN** | Alice Smith | Senior Engineer (DATABASE, CLOUD) | View assigned queue, acknowledge, investigate, resolve, add internal comments |
| `tech_bob` | **TECHNICIAN** | Bob Jones | Mid-level Engineer (NETWORK, HARDWARE) | Network incidents, incident lifecycle actions |
| `tech_carol` | **TECHNICIAN** | Carol White | Expert Engineer (SECURITY, AUTH) | Security incidents, incident lifecycle actions |
| `tech_david` | **TECHNICIAN** | David Brown | Junior Engineer (SOFTWARE, APP) | Software bugs, incident lifecycle actions |
| `emp_john` | **EMPLOYEE** | John Doe | Finance | Report incidents, verify & close own incidents, view public updates |
| `emp_sarah` | **EMPLOYEE** | Sarah Connor | Human Resources | Report incidents, track status, add comments |
| `emp_mike` | **EMPLOYEE** | Mike Ross | Legal & Compliance | Report incidents, track status, add comments |

---

## End-to-End API Walkthrough (cURL)

Execute this complete incident resolution journey using your favorite terminal.

### Step 1: Authenticate as Employee John
```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "emp_john", "password": "password123"}'
```
*Save the returned `"token"` as `EMP_TOKEN`.*

---

### Step 2: Report a High-Urgency Database Incident
```bash
curl -s -X POST http://localhost:8080/api/incidents \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Payment database connection pool exhausted",
    "description": "Checkout service throwing connection timeout errors on Postgres primary node",
    "serviceId": 1,
    "impact": "HIGH",
    "urgency": "CRITICAL",
    "affectedUserCount": 250
  }'
```
*Notice: Priority is automatically computed to `P1_CRITICAL` based on Impact and Urgency. SLA deadlines are calculated. An expert technician (Alice Smith) is automatically assigned based on expertise matching.*

---

### Step 3: Check Intelligent Duplicate Detection
```bash
curl -s -X GET http://localhost:8080/api/incidents/1/duplicates \
  -H "Authorization: Bearer $EMP_TOKEN"
```
*Returns potential duplicates evaluated using tokenized Jaccard similarity ($\ge 0.40$).*

---

### Step 4: Check Multi-Factor Technician Recommendations
```bash
curl -s -X GET http://localhost:8080/api/incidents/1/recommendations \
  -H "Authorization: Bearer $EMP_TOKEN"
```
*Returns top technicians ranked by multi-factor score: Skills (40%), Capacity (25%), Experience (20%), and Historical Service Affiliation (15%).*

---

### Step 5: Login as Technician Alice & Acknowledge
```bash
# 5a. Login as Alice
TECH_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "tech_alice", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 5b. Acknowledge the Incident (Transition: ASSIGNED -> IN_PROGRESS)
curl -s -X PUT http://localhost:8080/api/incidents/1/acknowledge \
  -H "Authorization: Bearer $TECH_TOKEN"
```
*Response timestamp is stamped into `SlaTracking`, stopping the Response Time SLA clock.*

---

### Step 6: Technician Adds Investigation Note & Resolves
```bash
# 6a. Add comment
curl -s -X POST http://localhost:8080/api/incidents/1/comments \
  -H "Authorization: Bearer $TECH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Increased HikariCP max pool size to 50 and cleared stuck idle transactions.", "isInternal": false}'

# 6b. Resolve Incident (Transition: IN_PROGRESS -> RESOLVED)
curl -s -X PUT http://localhost:8080/api/incidents/1/resolve \
  -H "Authorization: Bearer $TECH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resolutionSummary": "Connection pool limit increased to 50; idle connections recycled.", "rootCause": "Sudden traffic spike exceeded default pool limit"}'
```
*Resolution timestamp is recorded into `SlaTracking`, stopping the Resolution Time SLA clock.*

---

### Step 7: Employee Verifies & Closes Incident
```bash
curl -s -X PUT http://localhost:8080/api/incidents/1/close \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"closureReason": "Confirmed payments are processing normally."}'
```
*Incident reaches terminal state `CLOSED`. Workload counters for technician are decremented.*

---

### Step 8: View Real-Time Audit Trail & Executive Reports
```bash
# 8a. Login as Administrator
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 8b. View Immutable Audit Log for Incident 1
curl -s -X GET http://localhost:8080/api/incidents/1/audit \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 8c. Query Executive Overview Report (MTTA, MTTR, SLA Compliance Rate)
curl -s -X GET http://localhost:8080/api/reports/overview \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 8d. Query Technician Workload Distribution Report
curl -s -X GET http://localhost:8080/api/reports/technicians \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Automated Test Suite

The test suite covers unit, domain, integration, and security boundaries:

```
[INFO] Tests run: 92, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

| Test Class | Layer / Component | Test Count | Key Scenarios Covered |
|---|---|---|---|
| `IncidentStateTransitionTest` | Domain State Machine | 12 | Valid state transitions, illegal state transition blocks, closure & verification invariants |
| `TechnicianAssignmentStrategyTest` | Assignment Strategies | 6 | Round-robin cycling, workload-aware least loaded, expertise matching fallback |
| `AssignmentStrategyManagerTest` | Strategy Pattern | 3 | Dynamic runtime strategy switching, active strategy description |
| `IncidentFactoryTest` | Creational Factory | 4 | Complete incident building, default priority computation, SLA assignment |
| `IncidentServiceTest` | Application Service | 11 | Lifecycle progression, tandem group resolution with >=85% cutoff, authorization, notes |
| `IncidentCorrelationEngineTest` | Intelligent Features | 7 | Cross-service infrastructure dependency mapping, blast radius calculation, root cause clustering |
| `DuplicateDetectorTest` | Intelligent Features | 4 | Jaccard text similarity thresholding, duplicate linking, lookback window filtering |
| `SmartTechnicianRecommenderTest` | Intelligent Features | 1 | Multi-factor technician scoring (skills 50%, capacity 30%, experience 20%) |
| `AutoEscalationServiceTest` | Intelligent Features | 4 | Multi-tier escalation ladder (TECHNICIAN -> TEAM_LEAD -> IT_MANAGER -> SYSTEM_ADMINISTRATOR) |
| `SlaMonitorServiceTest` | SLA Daemon Scheduler | 3 | Approaching deadline detection, SLA violation detection, terminal exclusion |
| `AuditEventListenerTest` | Observer Listener | 4 | Decoupled logging of creation, status changes, assignments, and escalations |
| `NotificationEventListenerTest` | Observer Listener | 4 | Multi-channel dispatch (`IN_APP`, `EMAIL`) on domain lifecycle events |
| `IncidentSearchIntegrationTest` | Search & Specification | 8 | Dynamic multi-criteria filtering by keyword, status, priority, category, pagination |
| `ReportServiceTest` & `ReportControllerIntegrationTest` | Management Analytics | 7 | MTTR, MTTA, SLA compliance rate calculation, workload aggregation, endpoint security |
| `SecurityAuthorizationIntegrationTest` | Security & Auth | 11 | JWT issuance, unauthorized endpoint protection, role-based endpoint permissions |
| `CategoryServiceTest` & `ServiceCatalogTest` | Catalog & Services | 6 | Automated keyword-based category matching, service catalog status queries |

*For complete test catalog and assertion details, see [docs/TEST_CASES.md](docs/TEST_CASES.md).*

---

## Documentation Index

The `docs/` folder contains comprehensive documentation for grading, viva defense, and architecture review:

- **[PROJECT_REPORT.pdf](PROJECT_REPORT.pdf)**: Comprehensive 41-page official course project report for Group 4.
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: 4-tier layer model, component interactions, database schema, and security architecture.
- **[docs/DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md)**: Deep-dive into OOP principles, Design Patterns, and Student Viva Defense Q&A.
- **[docs/API.md](docs/API.md)**: Complete REST API catalog with sample JSON requests, responses, status codes, and cURL commands.
- **[docs/TEST_CASES.md](docs/TEST_CASES.md)**: Test matrix mapped against system requirements.
- **[docs/class-diagram.md](docs/class-diagram.md)**: Mermaid UML Class Diagram illustrating inheritance, associations, and design patterns.
- **[docs/er-diagram.md](docs/er-diagram.md)**: Mermaid Entity-Relationship Diagram detailing tables, keys, and foreign constraints.
- **[docs/use-case-diagram.md](docs/use-case-diagram.md)**: Mermaid Use Case Diagram covering all operational personas.

---

## Academic Viva Defense Checklist

Use this checklist during your viva examination to demonstrate direct mastery of the codebase:

- [x] **Where is Encapsulation demonstrated?**
  Point to `Incident.java` ([src/main/java/com/iitsm/domain/model/Incident.java](src/main/java/com/iitsm/domain/model/Incident.java)). Show that all fields are `private`, getters return unmodifiable collections where appropriate, and state cannot be changed via arbitrary setter; it requires `incident.transitionTo(nextState)`.
- [x] **Where is Polymorphism demonstrated?**
  Point to `AssignmentStrategyManager.java` and `TechnicianAssignmentStrategy.java`. Show how the strategy is resolved at runtime and invoked polymorphically: `strategy.assignTechnician(incident, availableTechnicians)`.
- [x] **Where is the State Pattern implemented?**
  Point to `com.iitsm.domain.state.IncidentState` and its 7 concrete classes. Show how transitions from `REPORTED` to `CLOSED` directly validate valid paths and throw `InvalidStateTransitionException` on illegal jumps.
- [x] **How is the Observer Pattern used without coupling?**
  Point to `IncidentService.java` publishing `DomainEvent` through Spring's `ApplicationEventPublisher`, and `AuditEventListener.java` + `NotificationEventListener.java` reacting independently.
- [x] **How do the Intelligent Features work?**
  Point to `DuplicateDetector.java` (tokenized Jaccard similarity with 7-day lookback) and `SmartTechnicianRecommender.java` (weighted multi-factor scoring algorithm).
- [x] **How does the SLA background daemon work?**
  Point to `SlaMonitorService.java` running on `@Scheduled(fixedRate = 60000)`. Show how it queries all non-terminal incidents, compares elapsed time against calculated deadline thresholds, and flags `APPROACHING` (at 80% mark) or `VIOLATED`.
