# Resolvo: Intelligent IT Service Management System (I-ITSM)
### Course: CS F213 / MAC F212 • Object Oriented Programming (Semester I 2026–27)
### Group Number: 4

| Student ID | Name |
| :--- | :--- |
| 2025A7PS0196H | Eshaan Sharma |
| 2025ADPS3006H | Divij Kedia |
| 2025ADPS0210H | Anant Sharma |
| 2025ADPS0124H | Arnav Gupta |

**Repository:** [https://github.com/divijkedia/OOPS-Project-Group4](https://github.com/divijkedia/OOPS-Project-Group4)

---

## Page 1
Resolvo
Intelligent IT Service Management and Incident
Resolution System
Semester I 2026–27
Group No. 4
Final report · 22 November 2026
Student ID
Name
2025A7PS0196H
Eshaan Sharma
2025ADPS3006H
Divij Kedia
2025ADPS0210H
Anant Sharma
2025ADPS0124H
Arnav Gupta
Source: divijkedia/OOPS-Project-Group4

---

## Page 2
Contents
1.
 Executive summary
3
2.
 Problem analysis
4
3.
 Requirements specification
5
4.
 System architecture
7
5.
 UML diagrams
7
6.
 Technology stack and selection
8
7.
 Source code
10
8.
 Database design
10
9.
 Testing and evaluation
11
10.
 Project demonstration
12
11.
 Object-oriented design
13
12.
 Intelligent features and innovation
14
13.
 Security
15
14.
 Exception handling
15
15.
 Limitations and future work
16
16.
 AI assistance
16
17.
 Appendix A Team responsibilities
17
18.
 Appendix B Role screens
18
19.
 Appendix C Diagrams
23

---

## Page 3
Executive summary
Resolvo is an IT service desk system built for a university campus or modern organization. It tracks an IT or facilities problem from the moment an
employee or student reports it to the moment they verify the fix, keeping a clear audit record of every change in between. It serves multiple
departments—such as Central IT and Campus Facilities—using a single shared domain model, where each department configures its own service
catalogue, operational queues, and technician team.
When someone runs into an issue, they describe it in ordinary words. Resolvo identifies the category and affected service, works out the priority
based on urgency and blast radius, applies the correct SLA policy, picks a suitable technician under active workload limits, and alerts the people
involved. The technician investigates the problem, attaches diagnostic screenshots or logs, tests the fix, and records the resolution notes. The
reporter tests the repair on their end, provides feedback, and closes the ticket. Every lifecycle event and timestamp is saved to an audit trail.
We built the backend in Java 21 with Spring Boot 3.3.5, the frontend in React 18 with TypeScript, and stored the relational data in PostgreSQL 16. We
chose a layered modular monolith so that an incident, its assignment, its SLA commitment, any diagnostic screenshots, and its audit entries all save
together in one database transaction. The business logic lives in plain Java domain classes. The State pattern guards the lifecycle transitions, Strategy
objects make technician assignment interchangeable, and ports and adapters keep external services cleanly outside the domain.
On top of the required core features, Resolvo includes practical detection tools: it catches duplicate reports using Jaccard token matching, groups
related incidents when an upstream service fails, escalates tickets through four levels as deadlines approach, recommends technicians based on
current workload and skills, and lets users paste screenshots directly from their clipboard with a high-resolution lightbox viewer. All automated
suggestions are strictly advisory: a human operator confirms them, and built-in rules keep everything working even without external network access.
We tested the system across every layer: pure domain unit tests, PostgreSQL integration tests, authorization checks, API contract tests, and React
component tests. The test suite contains 125 automated tests (93 backend and 32 frontend) that pass in under 20 seconds. Section 9 details the 24
representative test cases required by the project brief.

---

## Page 4
Problem analysis
Problem
A university or modern workplace depends on both digital services (like online fee payment, campus Wi-Fi, and the learning management system)
and physical infrastructure (like power supply, classroom projectors, and lab hardware). When something breaks, someone has to log the issue,
figure out how severe it is, assign the right technician, track response and resolution deadlines, keep the user informed, and record the fix. When
teams try to coordinate this over email chains, chat groups, and spreadsheets, tickets get lost, multiple people report the same problem, deadlines
pass unnoticed, and recurring infrastructure failures go unaddressed.
Stakeholders
Stakeholder
What they need
What Resolvo gives them
Reporters (Students / Faculty / Staff)
Report an issue in plain words, paste error
screenshots, know who is assigned, and track the fix.
Conversational intake, screenshot paste with Ctrl+V,
live SLA countdown, and fix verification with
feedback.
Technicians (Support Staff)
A clear, prioritized queue, full context, diagnostic
notes timeline, and past solutions.
Workload-balanced queue, one-click acknowledge,
screenshot attachment viewer, and tandem group fix.
Queue Supervisors (Team Leads)
See waiting tickets across the team, balance
workload, and handle escalations.
Queue boards, technician capacity load bars,
automated recommendation scoring, and manual
reassign drawers.
Administrators & Department Heads
Configure catalogues, rules, and SLA targets without
code; monitor service availability.
Operations Center, live SLA compliance gauges,
outage cluster alerts, routing strategy picker, and CSV
export.
Campus Operations & Evaluators
A system that is easy to explain, maintain, test, and
run locally.
Clean domain models, 125 automated tests,
documented OOP patterns, and reproducible seed
data.
Existing challenges
Challenge named in the brief
How Resolvo addresses it
Delayed response and SLA violations
Dual-clock tracking (response and resolution), a background checker warning before breaches, and 4-
tier escalation.
Incorrect prioritisation
Priority calculated from impact, urgency, and service criticality, with calculation reasons saved to the
audit log.
Inefficient technician allocation
Ranking by skill tags, active ticket count, availability, and past performance with explicit score
breakdowns.
Poor visibility into service health
Dedicated role-based portals, active enterprise outage cluster detection, and sanitized CSV audit export.
Duplicate incident reports
Jaccard token matching checks title and description in real time and offers an instant duplicate joining
option.
Incomplete incident history
Every state change, assignment, diagnostic note, and escalation writes an immutable record to an audit
table.
Difficulty identifying recurring problems
Correlation engine groups incidents sharing common infrastructure components for one-click tandem
resolution.
Lack of diagnostic evidence sharing
Direct screenshot and file attachment support with Base64 storage, thumbnail previews, and modal
viewing.
Proposed solution
Resolvo provides a single web application covering the full ITIL incident lifecycle: Intake, Prioritization, Assignment, Investigation, Resolution,
Verification, and Closure. Each role operates within its own workspace, backed by a domain model that runs completely on built-in rules, with
optional advisory assistance.
Assumptions
A single deployment serves all campus departments with role-based data partitioning.
The server's clock is the single source of truth for all SLA deadline calculations.
The original reporter, not the technician, confirms resolution effectiveness before closure occurs.
All algorithmic proposals (assignment, correlation, categorization) require human confirmation before state changes.

---

## Page 5
Requirements
User roles
We designed three core user roles required by the course syllabus: Employee (the reporter), Technician (the fulfiller), and Administrator (system
governance). We also added two practical management roles: Queue Supervisor (Team Lead) and Department Head (Service Owner) to handle team
workload balancing and service availability tracking. Each role maps to an explicit Java domain entity backed by Spring Security method
authorization.
Persona glossary
Product persona
Role description
Java class
Reporter
Employee, student, or faculty filing a service
disruption.
com.iitsm.domain.model.Employee
Fulfiller
Specialist technician diagnosing and resolving
tickets.
com.iitsm.domain.model.Technician
Supervisor
Team lead managing assignment queues and
reassigning overloaded tickets.
com.iitsm.domain.model.Supervisor
Administrator
System administrator managing SLA rules, services,
and routing strategies.
com.iitsm.domain.model.Administrator
Department Head
Service owner reviewing MTTA/MTTR metrics and
exporting audit logs.
com.iitsm.domain.model.DepartmentHead
Functional requirements
FR1 (Intake & Attachment): The user can report an incident via conversational chat or a structured form, providing a title, description, category,
and error screenshots or logs (via file drag-and-drop or clipboard paste with Ctrl+V ).
FR2 (Priority Scoring): The system calculates priority ( P1_CRITICAL to P4_LOW ) deterministically from urgency, impact, and affected service
criticality, recording the calculation rationale.
FR3 (SLA Binding): When a ticket is created, the system binds contractual first-response and resolution deadlines from the department's SLA
policy. The resolution clock pauses if information is requested from the reporter.
FR4 (Automated Dispatch): New incidents are automatically assigned to an available technician using the active assignment strategy (Round
Robin, Least Loaded, Skill Match, or Composite Ranking).
FR5 (Queue Rebalancing): Supervisors can inspect active technician workloads and manually reassign tickets when an engineer is overloaded or
absent.
FR6 (Guarded Lifecycle): Incidents must follow a guarded state machine: SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED , with
legal branches for PENDING_INFO , reopen, and cancellation.
FR7 (Investigation & Diagnostics): Technicians can post progress updates, diagnostic notes, and additional error screenshots while
investigating a ticket.

---

## Page 6
Functional requirements (continued)
FR8 (Resolution Recording): Technicians must specify a categorized root cause and non-empty fix notes before moving a ticket to RESOLVED .
FR9 (Verification & CSAT): The original reporter confirms whether the fix worked. If confirmed, they provide a 1–5 star rating and the ticket
moves to CLOSED ; if rejected, the ticket reopens.
FR10 (Duplicate Detection): As a user types, the system evaluates Jaccard token similarity against open tickets and suggests joining existing
ones if similarity ≥ 60%.
FR11 (Outage Clustering): The correlation engine groups co-occurring incidents sharing upstream infrastructure dependencies into an Outage
Cluster, displaying total affected users and allowing group resolution.
FR12 (Event Notifications): The system dispatches in-app notification toasts, updates unread badge counters, and sends email alerts upon
assignment and status changes.
FR13 (Audit Trail & CSV Export): Every state transition, assignment, and priority change writes an immutable audit entry. Department heads
can export RFC-4180 compliant CSV reports sanitized against formula injection.
Non-functional requirements
Requirement
How Resolvo meets it
Maintainability
Domain classes are pure Java with zero framework imports; GoF patterns (State, Strategy, Observer) keep business
rules modular; 125 automated tests prevent regressions.
Data integrity
ACID database transactions, foreign key constraints, optimistic locking ( @Version ), and append-only audit log
tables.
Security
Role-based access control, BCrypt password hashing, method-level @PreAuthorize guards, and CSV formula
sanitization.
Usability
Responsive layout from 1440px desktop down to 390px mobile, keyboard shortcuts ( Ctrl+V paste), accessible
contrast, and explicit error messages.
Reliability
Core workflows run entirely on built-in Java algorithms with local deterministic fallbacks, requiring zero external
cloud APIs.
Business rules
1. Capacity Barrier: A technician cannot be assigned a ticket if their active ticket count has reached their maximum capacity limit (default 5).
2. Department Isolation: Technicians can only receive and work on incidents belonging to their own operational department.
3. Guarded Transitions: State changes must satisfy lifecycle transition guards; direct jumps (e.g. SUBMITTED directly to CLOSED) are blocked with HTTP
409.
4. SLA Clock Pausing: The resolution countdown timer pauses strictly while a ticket sits in PENDING_INFO awaiting reporter input.
5. Verification Authority: Only the original reporter can mark a ticket CLOSED ; technicians cannot verify their own fixes.
6. Duplicate Warning: Potential duplicates warn the user, but the user retains the right to proceed if their issue is distinct.
7. Outage Cluster Escalation: When 4 or more downstream services fail due to a shared upstream component, the cluster escalates directly to P1.
8. Spreadsheet Formula Protection: Any exported CSV field starting with = , + , - , or @ is prepended with a single quote.

---

## Page 7
System architecture
+---------------------------------------------------------------------------------------------------+
|                                 CLIENT TIER (React 18 + TypeScript)                               |
|   Employee Portal   |   Technician Queue   |   Supervisor Drawer   |   Admin Operations Center    |
+---------------------------------------------------------------------------------------------------+
                                                  | HTTPS / JSON DTOs
+---------------------------------------------------------------------------------------------------+
|                         WEB & SECURITY LAYER (Spring MVC + Spring Security)                       |
|   IncidentController   |   TechnicianController   |   AdminController   |   SecurityAuthFilter    |
+---------------------------------------------------------------------------------------------------+
                                                  | DTO → Domain Command
+---------------------------------------------------------------------------------------------------+
|                        APPLICATION SERVICE LAYER (@Transactional Coordinators)                    |
|   IncidentService   |   AssignmentService   |   SlaService   |   IntelligenceService   |   Audit  |
+---------------------------------------------------------------------------------------------------+
                                                  | Coordinates Pure Entities
+---------------------------------------------------------------------------------------------------+
|                          DOMAIN CORE (Entities, Value Objects, GoF Patterns)                      |
|   Incident (Aggregate)  |  IncidentState (State)  |  AssignmentStrategy  |  SlaCommitment (Clock) |
+---------------------------------------------------------------------------------------------------+
                                                  | Repository Interfaces
+---------------------------------------------------------------------------------------------------+
|                     INFRASTRUCTURE LAYER (Spring Data JPA, PostgreSQL, Flyway)                    |
|   PostgreSQL 16 Database   |   In-Memory H2 Profile   |   Email Adapter   |   Attachment Store    |
+---------------------------------------------------------------------------------------------------+
        
Architectural style: Layered modular monolith
We chose a layered modular monolith for our backend. As a student team, our primary engineering goal was ensuring absolute data consistency.
When an incident is filed, the ticket, its technician assignment, its SLA target, any diagnostic attachments, and its audit entry must all commit
together in one atomic database transaction. If we had split this into microservices, we would have faced network latency, distributed transaction
failures, and complex deployment overhead. Instead, we organized our Spring Boot backend into clean internal layers: Web, Application, Domain,
and Infrastructure.
Codebase organization
Package / Directory
Responsibility
com.iitsm.domain.model
Pure domain classes: Incident , IncidentState hierarchy, Technician , User , and value objects.
com.iitsm.domain.strategy
Assignment and priority strategies ( RoundRobin , LeastLoaded , SkillMatch , Composite ).
com.iitsm.application.service
Transactional use-case orchestrators managing database writes and event publishing.
com.iitsm.web.controller
REST endpoints, input DTO validation, and HTTP response serialization.
resolvo-frontend/src/
React 18 components, role workspaces, TanStack Query hooks, and Tailwind CSS layouts.

---

## Page 8
Technology selection: the nine questions
Technology stack
Layer
Technology
Use in Resolvo
Language
Java 21 LTS, TypeScript 5.5
Backend domain models and transactional services; typed frontend client
application.
Backend framework
Spring Boot 3.3.5 (Web, Data JPA, Security,
Validation, Actuator)
REST API, transaction management, BCrypt password hashing, method
authorization, and health checks.
Database
PostgreSQL 16 / H2 Database Engine
Relational persistence with foreign keys, checks, and ACID transactions; file-
based and in-memory test profiles.
Schema migration
Flyway 10
Repeatable, version-controlled schema evolution (V1__init_schema through
V4__add_attachment_support).
API documentation
SpringDoc OpenAPI 2.6 (Swagger UI 3.0)
Automatic OpenAPI 3.0 documentation and interactive endpoint testing at
/swagger-ui.html .
Frontend framework
React 18.3, React Router 7
Component-based UI, client-side routing, and role-based workspace
layouts (Employee, Technician, Admin).
Server state
TanStack Query v5 (React Query)
Automated background caching, optimistic updates, and polling
invalidation for fresh SLA clocks.
UI & styling
Tailwind CSS 3.4, Lucide Icons, Recharts 3
Responsive layout system, accessible UI primitives, KPI compliance gauges,
and workload graphs.
Build & package
Maven 3.9, Vite 5.4
Backend dependency resolution and JAR packaging; frontend HMR and
optimized production bundling.
Testing harness
JUnit 5, MockMvc, Vitest 4, Testing Library
125 automated tests: domain unit tests, Data JPA integration tests, and
frontend component tests.
1. Why did you choose this programming language?
We chose Java 21 because it makes object-oriented design explicit, robust, and verifiable. Language features such as records (for immutable value
objects and DTOs), sealed interfaces (for restricted lifecycle state transitions), strongly typed generics, and strict access modifiers ( private ,
protected ) ensure that our domain rules are checked directly at compile time. Java's thread-safe concurrency primitives guarantee reliable
execution for our background SLA monitoring daemon. On the frontend, TypeScript gives us the exact same compile-time safety, preventing null
dereferencing and mismatched API calls.
2. Why did you choose this frontend technology?
We picked React 18 with TypeScript because it allowed us to build dedicated, role-specific workspaces for all five personas from a single set of
reusable, accessible components. TanStack Query handles server state caching, background polling, and cache invalidation automatically without
manual state spaghetti. Vite gives us near-instant hot-module reloading during development and builds clean, tree-shaken production bundles.
Tailwind CSS provides clean, consistent styling across desktop and mobile screens without bulky third-party component libraries.
3. Why did you choose this backend technology?
We selected Spring Boot 3.3.5 because it provides transaction management ( @Transactional ), input validation (Hibernate Validator), and method-
level security ( @PreAuthorize ) in one cohesive, well-documented framework. That freed our team to focus on writing clean business rules in plain
Java domain classes, without spending weeks writing custom boilerplate for database connections or HTTP parsing.

---

## Page 9
4. Why did you select this database?
ITSM data is intensely relational: reporters, technicians, departments, services, incidents, diagnostic notes, and audit records are bound by strict
relational integrity. PostgreSQL 16 enforces these links with foreign keys, unique constraints, and ACID transactions. For automated testing, we run
H2 in PostgreSQL compatibility mode ( MODE=PostgreSQL ), allowing our 93 backend tests to run in seconds without spinning up external database
servers.
5. Why did you choose this architecture?
We chose a layered modular monolith because it lets us save an incident, its technician assignment, its SLA target, and its audit record in a single
atomic database transaction. This completely avoids the distributed data inconsistency, network latency, and deployment headaches of
microservices, while keeping clear package boundaries that would allow future service extraction if ever needed.
6. What alternatives did you consider?
Alternative
Why we did not choose it
Node.js / Express or Python /
FastAPI
Both are viable, but Java's explicit type system, compile-time checks, and Spring's declarative transaction
boundaries make our pure OOP patterns (State, Strategy, Observer) much easier to demonstrate and defend.
Angular or Vue
React's declarative component model, vast ecosystem (TanStack Query, Lucide, Recharts), and lightweight runtime
gave us faster development velocity and simpler component testing.
MongoDB / NoSQL
Unsuited for an ITSM platform where cross-entity foreign keys, multi-table transactions, and auditable relational
integrity are fundamental requirements.
Microservices on Kubernetes
Introduces immense operational overhead, distributed transaction failures, and RPC latency that is completely
unjustified for an enterprise campus system built by a student team.
Cloud-Only AI Workflows
Network latency, API rate limits, and external provider outages would break emergency incident triage; Resolvo
prioritizes deterministic rule-based algorithms with advisory suggestions.
7. What are the advantages and limitations of your technology stack?
Advantages: End-to-end compile-time type safety, atomic transactional persistence, zero external cloud dependencies for local operation,
repeatable Flyway schema migrations, and rapid sub-second test execution across 125 automated tests.
Limitations: Higher baseline JVM memory consumption compared to Go or Rust runtimes; single-node deployments require vertical scaling or
load-balanced replicas for massive enterprise concurrency.
8. How does your technology support object-oriented design?
Java enforces encapsulation through private fields and public domain methods ( acknowledge() , resolve() ). Spring's dependency injection
injects collaborators through constructors, making Strategy and Observer implementations natural to build and easy to mock during tests. Domain
entities remain free of framework annotations.
9. How would your system evolve if the number of users increased significantly?
1. Database Tuning: Add composite B-Tree indexes on query predicates ( status , priority , service_id ) and tune the HikariCP connection pool.
2. Read Replicas: Route analytical reporting and dashboard queries to read-only database replicas, reserving the primary node for write transactions.
3. Stateless Scaling: Run multiple Spring Boot application instances behind an NGINX or Caddy reverse proxy using Redis for shared session management.
4. Transactional Outbox: Offload notification dispatch and email alerts to a message queue (RabbitMQ or Kafka) to isolate third-party I/O latency.
5. Selective Extraction: Carve out independent sub-domains (such as Audit Logging or Telemetry) into separate services only if team ownership requires
it.

---

## Page 10
Source code
Our complete source code is maintained in the GitHub repository divijkedia/OOPS-Project-Group4. The project is organized into clear
directories:
Folder
Contents
src/main/java/com/iitsm/
Spring Boot 3.3.5 backend: domain models, lifecycle states, strategies, factories, REST controllers, DTOs, and
services.
src/main/resources/
Configuration files ( application.yml ) and Flyway migration SQL scripts (V1 through V4).
src/test/java/com/iitsm/
93 JUnit 5 unit and integration tests verifying state transitions, strategies, SLA monitoring, and security filters.
resolvo-frontend/
React 18 + TypeScript + Vite frontend: role features (employee, technician, admin), components, API clients, and
Vitest suites.
scripts/
Cross-platform orchestration scripts for one-click startup and teardown ( run.bat , stop.bat ).
Running mvn spring-boot:run and npm run dev starts the backend on port 8080 and the frontend on port 5173 with full seed data.
Relational schema and representative sample data
Our database schema is organized into 13 tables managed by Flyway migrations up to V4__add_attachment_support.sql . It enforces strict foreign
keys, unique indexes, and check constraints.
Important relationships
Relationship
Meaning
it_services 1 — * incidents
Each IT service tracks disruptions and defines baseline business criticality.
incident_categories 1 — * incidents
Categories classify reports and match technical competencies of engineers.
users 1 — 1 employees / technicians / admins
Table-per-class / joined inheritance for specialized user attributes.
technicians * — * technician_skills
Engineers maintain proficiency levels across specific incident categories.
incidents 1 — * investigation_notes
Owned diagnostic notes and file/screenshot attachments that exist only with their incident.
incidents * — * incident_related
Self-referential join table linking duplicate and correlated outage tickets.
audit_records → incidents, users
Append-only chronological audit trail capturing all state and data mutations.
Sample data
Table
Representative sample records
it_services
Payment Processing Gateway (MISSION_CRITICAL), Corporate Email Service (HIGH), Student LMS Portal (MEDIUM).
incident_categories
Database, Network Infrastructure, Authentication & SSO, Hardware & Peripherals, Software Application.
users / technicians
emp_john (Reporter), tech_alice (Senior Database Specialist), admin (System Administrator).
incidents
"Payment checkout fails with database connection timeout", Priority P1, Status IN_PROGRESS, Assigned to
tech_alice.
investigation_notes
"Connection pool exhausted on postgresql-prod-01", with attached screenshot db-metrics.png (Base64).

---

## Page 11
Testing and evaluation
Test strategy
Level
Tools
What it covers
Domain unit tests
JUnit 5, AssertJ
State pattern transitions, priority formulas, SLA clock calculations, and
assignment ranking without a server.
Integration tests
Spring Boot Test, H2 (Postgres
Mode), MockMvc
Transactional boundaries, Data JPA queries, Flyway schema validation,
authorization, and HTTP error serialization.
Security authorization tests
Spring Security Test
Role-based access matrix: verifying that unauthorized users cannot view,
escalate, or resolve tickets.
Frontend component tests
Vitest, Testing Library
Form validation, SLA countdown timers, role route guards, and screenshot
attachment controls.
End-to-end workflows
MockMvc, Vitest Integration
Complete validation of the three core demonstration workflows across
intake, investigation, and governance.
Our test harness contains 93 backend tests and 32 frontend tests (125 automated tests total), all executing in under 20 seconds. Automated GitHub
Actions run them on every commit.
Representative test table for the report (Part 1: Cases 1–12)
Type
Scenario
Expected result
Evidence / Test Class
Normal
Reporter files P1 database outage with
screenshot.
P1 calculated, auto-classified to Database,
assigned to tech_alice, attachment stored in
Base64.
IncidentControllerIntegrationTest
Normal
Technician acknowledges ticket within
SLA window.
State moves to ACKNOWLEDGED, response
SLA clock permanently halts, audit entry
created.
IncidentLifecycleStateTest
Normal
Reporter submits clarification note with
diagnostic log.
State returns to IN_PROGRESS, resolution
clock resumes countdown, note appended
to audit trail.
IncidentControllerIntegrationTest
Normal
Technician resolves ticket with root cause
analysis.
State moves to RESOLVED, resolution clock
stops, satisfaction survey dispatched to
reporter.
IncidentServiceTest
Normal
Reporter confirms fix and submits 5-star
feedback rating.
State moves to VERIFIED then CLOSED, final
service cycle closed, feedback persisted.
IncidentLifecycleStateTest
Normal
Reporter reopens ticket due to recurring
symptoms.
State transitions to REOPENED, new service
cycle initiated under identical reference ID.
IncidentStateTransitionTest
Boundary
Score calculated right at the threshold of
P1 and P2 (score = 15).
Correctly maps to P1_CRITICAL without
arithmetic drift or precision loss.
WeightedPriorityCalculatorTest
Boundary
Technician assigned when exactly at
maximum capacity (5/5).
Skipped by assignment strategy; manual
assignment throws
WorkloadExceededException .
LoadBasedAssignmentTest
Boundary
SLA response clock measured at exactly 1
second before deadline.
Classified as WITHIN_SLA; approaching
warning flag remains active.
SlaMonitorServiceTest
Boundary
SLA response clock measured at exactly 1
second after deadline.
Marked BREACHED, SLA violation event
published, auto-escalation triggered.
SlaMonitorServiceTest
Invalid input
Incident submitted with empty title or
blank description.
HTTP 400 Bad Request returned with
descriptive field validation error; nothing
persisted.
IncidentControllerIntegrationTest
Invalid input
Incident submitted with invalid or non-
existent IT service ID.
HTTP 404 Not Found returned with safe
error payload; transaction rolls back cleanly.
IncidentControllerIntegrationTest

---

## Page 12
Representative test table for the report (Part 2: Cases 13–24)
Type
Scenario
Expected result
Evidence / Test Class
Invalid input
Negative or zero affected user count
submitted.
Enforced to minimum value of 1 by domain
constructor and Bean Validation.
IncidentFactoryTest
Exception
Database connectivity drops during
state transition.
HTTP 503 Service Unavailable returned;
transaction rolled back; no orphaned state.
GlobalExceptionHandlerTest
Exception
No technician available possessing
requisite category skill.
Incident saved in CLASSIFIED state; assigned
to unassigned queue; admin alert sent.
SkillBasedAssignmentTest
Exception
No SLA policy configured for custom
category/priority.
Fallback default SLA applied; ticket remains
active; administrator alerted to configure
policy.
SlaPolicyServiceTest
Authorization
Employee attempts to resolve an
incident ticket directly.
HTTP 403 Forbidden returned;
@PreAuthorize prevents method
invocation.
SecurityAuthorizationTest
Authorization
Technician attempts to access admin-
only strategy swapper.
HTTP 403 Forbidden returned; operation
logged to security audit.
SecurityAuthorizationTest
Authorization
Unauthenticated user calls protected
incident search endpoint.
HTTP 401 Unauthorized returned with clear
rejection payload.
AuthControllerIntegrationTest
Business rule
Attempt to close an incident directly
from NEW state.
Illegal state transition blocked;
InvalidStateTransitionException
thrown.
IncidentStateTransitionTest
Business rule
Employee attempts to view internal
diagnostic investigation notes.
Notes filtered out of response DTO; internal
diagnostic privacy strictly maintained.
IncidentControllerIntegrationTest
Business rule
Duplicate ticket submitted with Jaccard
similarity ≥ 85%.
Duplicate warning badge displayed; option to
join existing ticket offered.
DuplicateDetectorTest
Business rule
Correlated tickets resolved in tandem
with primary incident.
All tickets in cluster with match score ≥ 85%
resolved atomically; audit records logged.
IncidentServiceTest
Business rule
Administrator dynamically swaps
routing strategy from Skill to Load.
Strategy manager updates active strategy
immediately; subsequent assignments use
new rules.
AssignmentStrategyManagerTest
Project demonstration
Our companion video demonstrates the three core workflows using live data from the application:
Workflow
Demonstrated lifecycle and architectural interaction
1. Intake → Prioritise → Assign →
Notify
Employee reports checkout disruption with error screenshot. Keyword classifier suggests Database category;
multi-factor formula calculates P1; Skill Match Strategy selects tech_alice; in-app notification fires.
2. Investigate → Monitor SLA →
Resolve → Verify
Technician acknowledges (stopping response clock), posts diagnostic note with screenshot, resolves issue.
Background daemon tracks resolution deadline; reporter verifies fix and rates 5 stars.
3. Duplicates → Correlation →
Escalation
Multiple users report SSO failures. Duplicate engine detects match; correlation engine clusters shared
infrastructure dependency; overdue ticket escalates across 4-tier hierarchy.

---

## Page 13
Object-oriented design and extensibility
Abstraction and encapsulation
The Incident aggregate root strictly encapsulates its internal state. All entity fields are declared private . Modification of lifecycle status,
assignment, or SLA clocks can only occur through domain methods ( classify() , 
assignTo() , 
acknowledge() , 
resolve() ,
verifyResolution() ). 
Direct 
setter 
mutations 
are 
prohibited. 
Invalid 
operations 
throw 
domain-specific 
runtime 
exceptions
( InvalidStateTransitionException , WorkloadExceededException ) that are intercepted by the global exception handler and translated into
clean HTTP error responses.
Inheritance and where composition was chosen
We used inheritance strictly for genuine "is-a" relationships: Employee , Technician , and Administrator extend the abstract User base class.
For behavior that varies independently, we favored composition: an 
Incident does not inherit from an SLA policy; rather, it has an
SlaCommitment value object and delegates assignment ranking to an interchangeable AssignmentStrategy .
Polymorphism and design patterns
The system relies on runtime polymorphism to remain extensible. New assignment algorithms, notification channels, or classification rules can be
added simply by implementing their respective interfaces, without modifying existing domain code.
Collections used and trade-offs
Collection
Where used
Why we chose it and trade-off
ConcurrentHashMap
In-memory active assignment locks
Thread-safe O(1) lookups during concurrent ticket assignments without
coarse synchronization bottlenecks.
ArrayList
Audit records, ticket attachments
Fast append and indexed iteration; perfectly suited for chronological
timelines.
TreeSet
Priority-sorted queues
Maintains logarithmic O(log N) sorted order by urgency score and breach
proximity.
EnumMap
SLA policy lookup by Priority
High-speed array-backed lookup with zero hashing collisions for closed
sets of enum keys.
Patterns, their classes and the problems they solve (Part 1)
Pattern
Classes
Problem it solves
State
IncidentState , SubmittedState , AssignedState ,
InProgressState , ResolvedState , ClosedState
Eliminates massive switch statements; ensures that only valid
lifecycle transitions can execute.
Strategy
AssignmentStrategy , RoundRobinStrategy ,
LeastLoadedStrategy , SkillMatchStrategy
Allows administrators to hot-swap technician dispatch logic at
runtime without stopping the server.
Factory
IncidentFactory
Encapsulates complex incident creation, combining title
validation, priority scoring, and initial state setup.

---

## Page 14
Patterns, their classes and the problems they solve (Part 2)
Pattern
Classes
Problem it solves
Observer
DomainEventPublisher , IncidentLifecycleEvent ,
AuditEventListener , NotificationListener
Decouples state changes from side effects (audit logging, email
alerts, SLA recalculations).
Chain of Responsibility
AutoEscalationService (Technician → Team Lead →
System Admin → IT Manager)
Passes overdue tickets up an operational escalation ladder until
handled.
Decorator / Fallback
FallbackClassifier , KeywordClassifier ,
RuleBasedAdvisor
Wraps external advisory services with local rule-based fallbacks to
guarantee 100% offline uptime.
Intelligent features and innovation
Resolvo includes practical detection and decision-support tools engineered into the core domain:
Feature
How it works in Resolvo
A. Duplicate Detection
Computes real-time Jaccard token similarity over normalized title and description n-grams. Warns user if match ≥
60%.
B. Outage Clustering
Correlates concurrent failures sharing upstream dependencies, calculating blast radius (e.g. 935 users affected
across 4 services).
C. 4-Tier SLA Escalation
Continuously monitors deadlines, warning at 80% elapsed time and auto-escalating unacknowledged P1 tickets to
Team Leads.
D. Smart Ranking
Composite formula combining skill tags (40%), current workload (35%), SLA track record (15%), and availability
(10%).
E. Screenshot Pipeline
Native drag-and-drop and clipboard paste ( Ctrl+V ) for error images with Base64 storage and lightbox viewing.
F. Natural Language Intake
Extracts category, urgency, and affected service from free-form user descriptions, offering self-service fixes before
ticket creation.
Intelligent advisory triage & deterministic rules fallback
Algorithmic suggestions act strictly as non-binding advice for human operators. When analyzing incoming incident reports, Resolvo applies local,
deterministic rules first: Jaccard n-gram token overlap identifies duplicate submissions, regex patterns flag critical security disruptions, and directed
service dependency graphs compute failure blast radius. The system remains 100% operational in air-gapped environments with zero external
network connectivity.

---

## Page 15
Security, privacy and operational limits
Role-based access matrix
Security is enforced using Spring Security method-level annotations ( @PreAuthorize ) matching the user's authenticated role:
Operation / Endpoint
Reporter
Technician
Supervisor
Administrator
Report incident with screenshot
Allowed
Allowed
Allowed
Allowed
Acknowledge & start investigation
Blocked (403)
Allowed (Self)
Allowed (Team)
Allowed
Reassign technician
Blocked (403)
Blocked (403)
Allowed
Allowed
Submit resolution & root cause
Blocked (403)
Allowed (Self)
Allowed
Allowed
Verify repair & submit CSAT
Allowed (Author)
Blocked (403)
Blocked (403)
Allowed (Override)
Configure SLA policies & strategies
Blocked (403)
Blocked (403)
Blocked (403)
Allowed
Export RFC-4180 audit log
Blocked (403)
Blocked (403)
Allowed
Allowed
Data sanitization & attachment safety
To prevent spreadsheet formula injection attacks (CSV Injection / Formula Injection), all exported CSV fields are sanitized: any cell beginning with = ,
+ , - , @ , or tab characters is automatically escaped with a prepended single quote ( ' ). Uploaded screenshot files are validated for MIME type
( image/png , image/jpeg ), checked against a 5MB size limit, and stored as Base64 data URIs.
Exception situations and user messages (Part 1)
Situation
Handling and user message shown
Test Evidence
Invalid incident input
HTTP 400: "Title is required and must not exceed 200 characters."
IncidentControllerIntegrationTest
Invalid state transition
HTTP 409: "Cannot move ticket directly from SUBMITTED to
CLOSED."
IncidentLifecycleStateTest
Technician unavailable
Auto-assignment skips engineer; manual assignment throws 409:
"Technician is off-duty."
LoadBasedAssignmentTest
Workload limit exceeded
Auto-assignment skips; manual assignment throws 409: "Technician
has reached maximum active capacity."
LoadBasedAssignmentTest

---

## Page 16
Exception situations and user messages (Part 2)
Brief situation
Handling and user message shown
Test Evidence
Service not found
HTTP 404: "Affected IT Service with ID does not exist."
IncidentControllerIntegrationTest
Missing SLA policy
HTTP 200: Default global SLA applied; admin alerted: "Default
policy assigned to P1."
SlaPolicyServiceTest
Duplicate incident
Banner alert: "A similar open incident exists for this service. Join
incident or proceed?"
DuplicateDetectorTest
Database failure
HTTP 503: "Service temporarily unavailable. Please retry shortly." No
stack trace leak.
GlobalExceptionHandlerTest
Network / client error
Client toast: "Unable to reach Resolvo server. Your draft has been
preserved in browser."
AppShell.test.tsx
Malformed request body
HTTP 400: "Request payload is malformed or unreadable."
IncidentControllerIntegrationTest
Limitations and future work
Single JVM Host: The platform runs on a single EC2 instance. While sufficient for our campus evaluation, enterprise multi-region scale would
use an active-active clustered setup with Redis session sharing.
Synchronous Notification Delivery: Email alerts are currently sent during the request. Moving to a transactional outbox queue (RabbitMQ or
Kafka) will isolate email delivery latency from web responses.
Base64 Attachment Size: Base64 encoding increases storage size by roughly 33%. For large video recordings or crash dumps, we would
transition to direct-to-S3 pre-signed upload URLs.
Automated Root Cause Learning: Our correlation engine uses static service dependency maps. Adding graph learning on historical incident
patterns could help predict cascading failures before symptoms appear.
AI assistance
Our team (Group 4: Eshaan Sharma, Divij Kedia, Anant Sharma, and Arnav Gupta) designed, coded, tested, and owns the entire software architecture,
domain model, database schema, and test suite. We used AI tools (Claude Code, Cursor, and Gemini CLI) during development as productivity aids—
helping us explore syntax options, generate repetitive DTO boilerplate, scaffold initial test templates, and proofread documentation. Every
architectural decision, design pattern, business rule, and automated test was reviewed, verified, and run by our team members. The intelligent triage
features inside Resolvo (such as Jaccard duplicate detection and outage clustering) are built-in Java algorithms with local deterministic fallbacks.

---

## Page 17
Appendix A Team responsibilities
Group No. 4 · CS F213 / MAC F212 · Semester I 2026–27
Our team divided the work into balanced backend and frontend responsibilities, ensuring every member contributed across design, coding, testing,
and documentation:
Student ID
Name
Assigned Architectural Modules & Leadership
2025ADPS3006H
Divij Kedia
Backend: Domain aggregate root, State pattern lifecycle, Factory pattern, relational
database schema, Flyway migrations (V1–V4), screenshot attachment infrastructure,
AWS deployment runbook.
2025A7PS0196H
Eshaan Sharma
Frontend: Employee & Reporter experience, conversational intake desk, ticket
reporting with real-time duplicate warnings, drag-and-drop & clipboard paste
screenshot controls, fullscreen lightbox viewer.
2025ADPS0210H
Anant Sharma
Backend: Continuous SLA monitoring daemon, dual-clock tracking, automated
testing harness (93 backend + 32 frontend tests = 125 tests), benchmarking,
concurrency race tests, technical documentation.
2025ADPS0124H
Arnav Gupta
Backend & Frontend: Multi-vector correlation engine, outage cluster detection, 4-
tier escalation hierarchy, Strategy pattern (Priority & Assignment routing), Admin
Operations Center dashboard.
Detailed member contributions
Divij Kedia: Engineered the pure domain model in com.iitsm.domain.model . Implemented the nine-state lifecycle state machine ( IncidentState
hierarchy) with strict access guards. Designed the relational schema and Flyway migrations, including the V4 attachment support enabling Base64
screenshot persistence. Authored the deployment runbook for EC2, RDS PostgreSQL, and S3.
Eshaan Sharma: Developed the React 18 frontend architecture. Built the Employee Portal, conversational intake forms, and real-time category
suggestion cards. Engineered the rich attachment pipeline ( AttachmentInput.tsx and AttachmentViewer.tsx ) supporting clipboard pasting
( Ctrl+V ), preview chips, and fullscreen high-resolution modal inspection.
Anant Sharma: Implemented the background SLA monitor daemon with dual-clock response and resolution deadlines. Built the full 125-test
automated testing suite across JUnit 5, MockMvc, and Vitest. Conducted stress benchmarks and concurrency race condition evaluations under
optimistic locking.
Arnav Gupta: Designed the multi-vector correlation algorithm clustering co-occurring disruptions across shared infrastructure components. Built
the four-tier automated escalation chain ( AutoEscalationService ) and the dynamic Strategy pattern manager. Constructed the Enterprise
Operations Center dashboard featuring the scrollable correlated tickets strip.
Demonstration presentation plan
In our recorded video demonstration, Divij presents the system architecture, domain models, and deployment; Eshaan demonstrates employee
intake, duplicate hints, and screenshot attachments; Anant presents SLA monitoring, countdown timers, and test validation; and Arnav demonstrates
technician investigation, correlation clusters, and administrative governance.

---

## Page 18
Appendix B Role screens
Reporter — conversational reporting and tracking
Desktop view (1440px) and responsive mobile viewport (390px) · Resolvo Employee Portal
RESOLVO · Employee Workspace > Report Disruption
User: emp_john (Standard Employee)
What's happening? Describe the issue in your own words
Payment checkout fails with database connection timeout when submitting credit card
transactions on the portal...
[Attached Screenshot: error-trace-500.png (142 KB) · Drag & Drop or Paste with Ctrl+V]
Auto-Classification Match
Predicted Category: Database · Affected Service: Payment Processing Gateway
Active Disruption Notices
• Payment Gateway: Degraded
• Campus Wi-Fi: Normal
• Student LMS: Normal
Recent Reports (emp_john)
INC-101: P1 · In Progress (SLA: 42m)
INC-084: P3 · Verified & Closed
Impact: High · Urgency: Critical · Affected Users: 150
Submit Incident Report →
The employee portal provides an intuitive conversational interface where natural language reports are analyzed in real time. The duplicate detection
heuristic displays warnings if similar open tickets exist, and the attachment dropzone allows instant screenshot staging via keyboard paste ( Ctrl+V ).

---

## Page 19
Appendix B Role screens
Fulfiller — technician workbench and diagnostics
Desktop view (1440px) · Resolvo Technician Workspace
RESOLVO · Technician Workbench > Active Investigation
Technician: tech_alice (Database Specialist · Capacity: 3/5)
INC-101: Payment Checkout Database Timeout
P1 CRITICAL
Reported by: emp_john · Service: Payment Gateway · Assigned Strategy: SkillMatch (Jaccard:
0.92)
Reporter Diagnostics & Attachments:
Screenshot attached: error-trace-500.png (HTTP 500 Connection Pool Exhausted) [Click to
inspect in Lightbox]
Investigation Log & Resolution Findings:
Root Cause: HikariCP connection leak on postgresql-prod-01 during burst batch settlement.
Remediation: Terminated orphaned idle locks, increased max-pool-size to 40, deployed leak-
detection-threshold=2000ms.
SLA Countdown Timer
Resolution Due: 00:38:14
Status: Within SLA (P1 Target: 2h 00m)
Actions
Request Info (Pause SLA)
Mark Resolved →
The technician workbench surfaces diagnostic attachments, root cause recording forms, and dual-clock SLA indicators. A single click transitions the ticket
to RESOLVED, halting the SLA clock and dispatching customer verification prompts.

---

## Page 20
Appendix B Role screens
Supervisor — queue board and workload balancing
Desktop view (1440px) · Resolvo Team Lead Operations
RESOLVO · Queue Supervisor > Central IT Department
Supervisor: lead_robert (Central IT Dispatcher)
14
Active Tickets
2
Unassigned Queue
1
SLA Warning (<20%)
94.2%
MTTR Compliance
Technician Capacity & Workload Distribution
Technician
Active / Max
Workload Bar
Specialization
Status
tech_alice
3 / 5
Database, SQL, HikariCP
Available
tech_bob
5 / 5
Network, Cisco, DNS
At Capacity
tech_charlie
1 / 5
Auth, SSO, LDAP
Available
Queue Strategy: CompositeScoring (Skill 40% + Load 35% + SLA 15% + Avail 10%)
Open Reassignment Drawer
Supervisors monitor team capacity and handle operational escalations. The slide-out reassignment drawer allows instant ticket transfer when a technician
reaches capacity limits or when an urgent SLA requires priority reallocation.

---

## Page 21


Appendix B Role screens
Administrator — enterprise operations center & clusters
Desktop view (1440px) · Resolvo System Administration Portal
RESOLVO ADMIN · Enterprise Operations Center
Admin: sys_admin (System Governance)
55
Total Reported
20
Open & Active
53
P1 Disruptions
36
Resolved / Closed
36
SLA Violations
Active Enterprise Outage & Infrastructure Clusters (1)
High System Impact
Correlated multi-service incidents sharing common infrastructure components and cascading failure modes.
CLUST-001 P1 Component: User Authentication Service
935 Affected Users
Upstream disruption in 'User Authentication Service' cascading across 4 downstream services (Payment Gateway, Customer Database, Corporate Email,
Student Portal).
Correlated Tickets (24):
INC-
1
INC-
161
INC-
321
INC-
353
INC-
385
INC-
417
INC-
2
INC-
34
INC-
162
INC-
322
INC-
386
INC-
3
INC-
163
INC-
132
INC-
164
INC-
133
INC-
165
INC-
293
INC
294
Active Routing Strategy: CompositeScoring (Hot-swappable)
Export RFC-4180 Audit Log (CSV)
The Operations Center provides real-time system visibility. The Infrastructure Cluster card groups cascading failures under a single root component and
provides a scrollable ticket strip to cleanly display large incident clusters.

---

## Page 22
Appendix B Role screens
Department head — service level agreement oversight
Desktop view (1440px) · Resolvo IT & Facilities Governance Console
RESOLVO · Department Governance > SLA Performance
Department Head: mgr_davis (Central IT Service Owner)
97.8%
Overall SLA Compliance
14m
Mean Time to Acknowledge
1h 42m
Mean Time to Resolve
4.8 / 5.0
Reporter CSAT Rating
Business Service
Criticality
Tickets (30d)
Breaches
Availability
Payment Processing Gateway
MISSION_CRITICAL
42
1 (2.4%)
99.98%
Corporate Email Service
HIGH
28
2 (7.1%)
99.40%
Internal File Storage
MEDIUM
19
0 (0.0%)
99.90%
Export Sanitized Audit Report (RFC-4180 CSV)
Service owners track MTTA, MTTR, and SLA compliance across business-critical infrastructure. One-click CSV export generates audit-compliant reports
sanitized against spreadsheet formula injection.

---

## Page 23
Diagram 1: Layered Modular Monolith
Resolvo's four architectural layers with strict directional dependencies, transactional boundaries, and external ports.
Resolvo Spring Boot Core Service Boundary (Layered Modular Monolith)
Web & Presentation Layer (REST Controllers, Security Filters, DTOs)
IncidentController
/api/incidents/**
TechnicianCtrl
/api/technicians/**
AdminCtrl
/api/admin/**
IntelligenceCtrl
/api/intelligence/**
AuditController
/api/audit/**
Application Layer (Use Case Coordinators & Transaction Boundary @Transactional)
IncidentService
• createIncident()
• transitionState()
AssignmentSvc
• assignTechnician()
• reassign()
SlaService
• calculateSla()
• checkBreaches()
IntelligenceSvc
• detectDuplicates()
• correlateClusters()
AuditService
• logTransition()
• exportAuditCsv()
Domain Core Layer (Entities, Value Objects, Domain Events, Sealed State Pattern)
Incident (Aggregate)
• ticketNumber, title
• status, priority
• List<Attachment>
IncidentState (Sealed)
• Submitted, Assigned
• InProgress, PendingInfo
• Resolved, Closed
Technician / User
• id, email, role
• Set<SkillTag>
• activeTicketCount
SlaCommitment
• responseDue
• resolutionDue
• breached: boolean
AssignmentStrategy
• RoundRobin
• LeastLoaded
• CompositeRank
Infrastructure & Adapters Layer (Spring Data Repositories, Database, Ports & Notification)
IncidentRepository
PostgreSQL 16 / Flyway V1-V4
NotificationAdapters
In-App Alerts / SMTP Relay
IntelligencePorts
Jaccard / Heuristic Fallback
AttachmentStore
Base64 Relational / S3

---

## Page 24
Diagram 2: Five Roles Across Three Personas
Use case associations mapping user personas to permitted actions across the incident lifecycle.
Stakeholder Roles
Reporter (Employee)
• End-users, students, staff
• Initiates incident intake
• Verifies / confirms repair
Fulfiller (Technician)
• Hardware/software specialist
• Diagnoses & attaches logs
• Records formal resolution
Supervisor (Team Lead)
• Operational queue manager
• Reassigns tickets / loads
• Handles SLA escalation
Administrator
• System governance & config
• Strategy & SLA rule setup
• Outage cluster monitoring
Department Head
• Executive service owner
• MTTA / MTTR analytics
• Sanitized CSV export
Authorized System Use Cases & Interactions
UC-1: Submit Incident with Screenshots & Logs (Reporter)
UC-2: View SLA Countdown & Real-time Progress (Reporter, Technician)
UC-3: Acknowledge Assignment & Start Investigation (Technician)
UC-4: Request Clarification / Attach Evidence (Technician, Reporter)
UC-5: Record Formal Root Cause & Mark Resolved (Technician)
UC-6: Verify Repair or Reopen Disputed Ticket (Reporter)
UC-7: Reassign Technician & Override Priority (Supervisor)
UC-8: Hot-swap Assignment Strategy (Admin)
UC-9: Correlate Major Infrastructure Outages (Admin, Lead)
UC-10: Export Sanitized RFC-4180 Audit Log (Dept Head, Admin)

---

## Page 25
Diagram 3: User Hierarchy and Staff Associations
Class diagram capturing the user polymorphism, role privileges, departmental tenancy, and skill tags.
«abstract»
User
- id: Long
- email: String
- fullName: String
- role: Role [REPORTER, TECHNICIAN, ADMIN]
+ hasPermission(perm: Permission): boolean
+ getDepartment(): Department
Department
- id: Long
- name: String
- code: String
+ getQueues(): List
1
0..*
Employee (Reporter)
- employeeId: String
- officeLocation: String
- contactNumber: String
+ reportIncident(): Ticket
+ verifyResolution(): void
Technician (Fulfiller)
- skills: Set<SkillTag>
- activeTicketCount: int
- maxCapacity: int (default: 5)
- isAvailable: boolean
+ canAcceptTicket(): boolean
+ recordResolution(notes: String)
+ attachDiagnostics(att: Attachment)
Administrator / Lead
- adminTier: String
- accessAuditScope: Scope
+ reassignTicket(id, techId)
+ setAssignmentStrategy(str)
+ updateSlaConfig(policy)
«value object» SkillTag
- tag: String
- category: String
0..*

---

## Page 26
Diagram 4: Incident Aggregate and Owned Values
Domain aggregate boundary showing root entity `Incident` encapsulating its value objects, attachments, SLA clock, and audit history.
Incident Aggregate Boundary (ACID Invariant Core)
«aggregate root»
Incident
- id: Long
- ticketNumber: String (e.g., "INC-101")
- title: String
- description: String
- status: IncidentStatus
- priority: Priority [P1, P2, P3, P4]
+ assign(technician: Technician, actor: User)
+ startInvestigation(actor: User)
+ resolve(findings: Resolution, actor: User)
+ verify(csat: int, feedback: String)
+ attachFile(attachment: IncidentAttachment)
IncidentAttachment
- id: Long
- filename: String
- fileType: String
- dataUri: String (Base64)
- fileSize: long
0..*
SlaTarget
- responseDue: Instant
- resolutionDue: Instant
- respondedAt: Instant
- resolvedAt: Instant
- isBreached: boolean
1
TechnicianAssignment
- technician: Technician
- assignedAt: Instant
- assignedBy: User
- strategyUsed: String
- rationaleNotes: String
0..1
«value» ResolutionDetails
- rootCauseCategory: String
- fixDescription: String
- preventiveMeasures: String
- verifiedByReporter: boolean
- csatRating: Integer (1-5)
0..1
AuditTrailEntry (Immutable)
- id: Long
- actor: User
- action: AuditAction
- previousState: String
- newState: String
- timestamp: Instant
0..*

---

## Page 27
Diagram 5: Lifecycle Behavior Classes (State Pattern)
The polymorphic State design pattern enforcing valid enterprise transitions and guarding against illegal out-of-order mutations.
Incident (Context)
- state: IncidentState
- ticketNumber: String
+ setState(state: IncidentState)
+ assign(tech: Technician)
+ resolve(notes: String)
«interface / sealed»
IncidentState
+ assign(ctx: Incident, tech: Technician): void
+ startInvestigation(ctx: Incident): void
+ requestClarification(ctx: Incident, q: String): void
+ resolve(ctx: Incident, details: Resolution): void
+ verify(ctx: Incident, csat: int): void
+ cancel(ctx: Incident, reason: String): void
+ getStatusName(): String
delegates
SubmittedState
• assign() → Assigned
• cancel() → Cancelled
• resolve(): Throws
• verify(): Throws
AssignedState
• startWork() → InProgress
• reassign() → Assigned
• cancel() → Cancelled
• verify(): Throws
InProgressState
• requestInfo() → Pending
• resolve() → Resolved
• attachFile() → InProgress
• cancel(): Throws
PendingInfoState
• reply() → InProgress
• SLA Clock Paused
• resolve(): Throws
• verify(): Throws
ResolvedState
• verify(csat) → Closed
• reject() → InProgress
• SLA Stopped
• assign(): Throws
ClosedState
• Immutable Final State
• Reopen by Lead only
• All mutations rejected
• Archived to Audit Log
CancelledState
• Reporter aborted intake
• Terminal State
• Releases technician
• Nullifies SLA target

---

## Page 28
Diagram 6: Catalogue and SLA Commitments
Class relationships between organizational departments, service catalogues, SLA policies, and cascade dependencies.
Department
- id: Long
- name: String
- code: String
- businessHours: Hours
+ getServices(): List
+ getCategories(): List
1
1..*
ITService (Catalogue)
- id: Long
- name: String
- code: String (e.g. AUTH-01)
- defaultPriority: Priority
- isActive: boolean
+ getEffectiveSla(): SlaPolicy
+ getDownstreamDeps(): List
+ calculateBlastRadius(): int
1
1..*
SlaPolicy
- priority: Priority
- responseHours: double
- resolutionHours: double
- escalationThreshold: int
+ computeResponseDue()
+ computeResolutionDue()
+ isBusinessHoursOnly()
instantiates
SlaTarget (Per-Ticket)
- responseDueAt: Instant
- resolutionDueAt: Instant
- respondedAt: Instant
- resolvedAt: Instant
- responseBreached: bool
- resolutionBreached: bool
+ evaluateBreach(): boolean
ServiceDependency (Graph)
- upstreamService: ITService
- downstreamService: ITService
- failureWeight: double
- criticality: String
+ getCascadeRadius(): int
+ triggersClusterOutage(): bool
1..*
Four-Tier SLA Escalation Ladder (Automatic Progression on Breach Proximity)
Tier 1 (>50% SLA remaining): Standard priority queueing; routine technician notification.
Tier 2 (<30% SLA remaining): Urgent priority bump; visual yellow badge on technician dashboard.
Tier 3 (<10% SLA remaining): Critical alert; SMS/In-App paging dispatched directly to Team Lead.
Tier 4 (Breached / Past Deadline): Emergency incident re-routing, department head audit flag logged.

---

## Page 29
Diagram 7: Assignment Strategies (Strategy Pattern)
Polymorphic strategy hierarchy allowing administrators to hot-swap technician dispatch logic dynamically at runtime.
AssignmentService (Context)
- activeStrategy: AssignmentStrategy
- strategyMap: Map<String, Strategy>
+ assign(incident: Incident): Technician
+ setStrategy(strategyName: String): void
+ getAvailableTechnicians(): List
delegates
«interface»
AssignmentStrategy
+ selectTechnician(inc: Incident, techs: List): Technician
+ getStrategyCode(): String
+ rankCandidates(inc: Incident, techs: List): List<RankedTech>
RoundRobinStrategy
- atomicIndex: AtomicInteger
• Equitable cyclic rotation
• Filters techs at maxCap
• Thread-safe counter
LeastLoadedStrategy
- lock: ReentrantLock
• Minimizes active tickets
• Prevents technician burnout
• Balances queue depth
SkillMatchStrategy
- tagWeights: Map<String, Dbl>
• Jaccard skill-token overlap
• Matches network/DB tags
• Falls back to LeastLoaded
CompositeScoring
- wSkill: 0.40, wLoad: 0.35
• wPerf: 0.15, wAvail: 0.10
• Highest composite score
• Explains rationale in notes
Score = (0.40 × SkillMatch) + (0.35 × (1 - Active/Cap)) + (0.15 × SLA_Perf) + (0.10 × Avail)
The composite score objectively ranks technicians while ensuring hard capacity limits (Active < MaxCap) are never violated.

---

## Page 30
Diagram 8: Notification Ports and Adapters
Decoupled notification architecture utilizing the Observer and Adapter patterns to broadcast lifecycle events across channels.
DomainEventPublisher (Spring)
+ publishEvent(event: IncidentLifecycleEvent)
+ registerListener(listener: EventListener)
@TransactionalEventListener(phase = AFTER_COMMIT)
dispatches
NotificationDispatcher (Port)
- registeredChannels: List<NotificationChannel>
+ route(event: IncidentLifecycleEvent): void
+ buildMessage(recipient, template): NotificationMessage
+ handleDeliveryFailure(ch: Channel, err: Exception)
«interface / port»
NotificationChannel
+ send(recipient: User, msg: Message): boolean
+ getChannelType(): ChannelType
+ isAvailable(): boolean
InAppNotificationAdapter
- repo: NotificationRepository
• Writes to in_app_notifications
• Unread badges on Navbar
• Real-time toast broadcast
EmailNotificationAdapter
- mailSender: JavaMailSender
• HTML & plain-text MIME emails
• SLA breach escalation warnings
• Mock fallback during local test
WebSocketAdapter
- template: SimpMessagingTemp
• STOMP /topic/incidents/
• Live status changes on board
• Auto-reconnect client handling

---

## Page 31
Diagram 9: Frozen Intelligence Ports and Adapters
Deterministic, frozen ports and heuristic fallbacks isolating the core business domain from external machine learning providers.
Domain Core & Intelligence Ports (Framework-Free Contracts)
«port»
DuplicateDetectorPort
+ findDuplicates(text, scope)
«port»
IncidentClassifierPort
+ classify(text): Category, Pri
«port»
ResolutionAdvisorPort
+ recommendFixes(inc): Advice
Primary Machine Learning Adapters (OpenAI / Vector Embeddings)
JaccardDuplicateDetector
• Tokenizes into n-grams
• J(A,B) = |A∩B| / |A∪B|
• Filters threshold ≥ 0.60
• Fully deterministic & local
OpenAiClassifierAdapter
• Few-shot prompt engineering
• Extracts JSON schema
• Enforces P1-P4 taxonomy
• Circuit breaker guarded
VectorKnowledgeAdvisor
• Cosine similarity matching
• Scans past verified fixes
• Ranks top-3 solutions
• Embeddings cache in memory
on timeout / API error
Deterministic Rule-Based Fallback Engine (Guaranteed System Availability)
KeywordHeuristicClassifier
• Regex dictionary for "crash", "down", "outage" → P1_CRITICAL
• "slow", "error", "failed" → P2_HIGH
• Substring matching for services ("wifi", "auth", "email", "portal")
• Zero network calls, 0ms execution latency
HistoricalPatternAdvisor
• Queries relational database for most frequent resolution
• Filters by exact service_id and root_cause_category
• Provides verified remediation runbook links
• Complete offline functionality during air-gapped deployment

---

## Page 32
Diagram 10: Conversation Types and Separate Intake Aggregate
Separation of interactive chat intake sessions from persisted transactional Incident aggregates.
IntakeSession (Aggregate)
- sessionId: UUID
- reporter: User
- transcript: List<ChatMessage>
- extractedEntities: Map<String, Object>
- currentDraft: DraftIncident
- conversationKind: ConversationKind
- step: IntakeStep [GREET, COLLECT, VERIFY]
+ appendUserUtterance(text: String): StepResult
+ suggestSelfServiceArticle(): Article
+ commitToIncident(): Incident
+ abort(): void
commits to
Incident (Persisted Record)
- id: Long (DB Primary Key)
- ticketNumber: String (Unique)
- reporterId: Long (Foreign Key)
- title: String
- description: String
- status: IncidentStatus (SUBMITTED)
- priority: Priority
- slaTarget: SlaTarget
+ assignTechnician()
+ startWork()
+ resolveTicket()
Conversation Type Hierarchy & Multi-turn Dialogue Policies
«abstract policy»
ConversationPolicy
+ nextMove(session: IntakeSession): NextMove
IncidentReportPolicy
• Collects service & urgency
• Checks duplicate threshold
• Summarizes formal draft
SelfServiceAdvicePolicy
• Suggests FAQ runbooks
• Guides password / VPN reset
• Deflects routine inquiries
StatusInquiryPolicy
• Queries active tickets
• Reports SLA countdown
• Displays technician notes

---

## Page 33
Diagram 11: Guarded Incident State Machine
Deterministic finite state machine with guarded triggers, role-based preconditions, and side-effect actions.
submit()
SUBMITTED
SLA clock starts
assignTechnician()
ASSIGNED
Tech notified
startWork()
IN_PROGRESS
Investigation
reassign() [Supervisor]
PENDING_INFO
SLA clock paused
requestClarification()
provideResponse()
resolve(findings, rootCause)
RESOLVED
SLA clock stopped
verifyResolution(csat ≥ 1)
CLOSED
Archived & Locked
reopen(rejected
CANCELLED
Aborted by User
cancel()
cancel()
State Machine Invariants & Guard Conditions
• Guard 1 (Assignment Precondition): Technician must be active, assigned to same department, and have activeTicketCount < maxCapacity.
• Guard 2 (Resolution Integrity): Technician must specify valid rootCauseCategory and non-empty fixDescription (≥10 characters).
• Guard 3 (SLA Tracking): PENDING_INFO pauses SLA clock; RESOLVED freezes target clock; CLOSED seals ticket permanently.
• Guard 4 (Authorization Barrier): Only assigned technician or admin can mark RESOLVED; only original reporter can mark CLOSED.

---

## Page 34
Diagram 12: Workflow 1 — Report, Prioritize, and Assign
Sequence of interactions from user submission, through priority evaluation, assignment strategy, and notification dispatch.
Reporter (UI)
IncidentCtrl
IncidentSvc
StrategyEngine
PostgreSQL
NotificationDisp
POST /api/incidents (DTO)
createIncident(dto, user)
computePriority & bindSLA
selectTechnician(incident)
rankCandidates()
return chosenTech (T-102)
save(incident, assignment, sla, audit)
COMMIT (ticketNumber: "INC-101")
publish(IncidentAssignedEvent)
sendInApp & SMTP
return IncidentResponseDTO
HTTP 201 Created
ACID Guarantees & Event Decoupling:
Incident creation, technician load increment, SLA binding, and audit logging execute inside a single transactional block. External notifications execute asynchronously after transaction commit via Spring's @Transa

---

## Page 35
Diagram 13: Workflow 2 — Investigate, Resolve, and Verify
Sequence of interactions during technician diagnostics, diagnostic attachment upload, SLA freeze, and reporter CSAT verification.
Technician (UI)
AttachmentSvc
IncidentSvc
SlaService
PostgreSQL
Reporter (UI)
PATCH /api/incidents/101/start-work
recordResponseTimestamp()
POST /attachments (Base64 file)
INSERT INTO incident_attachments
PATCH /api/incidents/101/resolve (findings)
stopResolutionClock(now)
UPDATE incidents SET status='RESOLVED'
Notify: "Your ticket has been marked RESOLVED"
PATCH /api/incidents/101/verify (csat: 5, "Working perfectly")
UPDATE incidents SET status='CLOSED', closed_at=now
DECREMENT technician active_ticket_count
HTTP 200 OK (Ticket Closed)
Technician diagnosis files (Base64 data URIs) are indexed with cryptographic checksums. Resolving immediately halts the SLA countdown timer; reporter verification decrements the technician's workload counter

---

## Page 36
Diagram 14: Workflow 3 — Duplicate Detection and Infrastructure Outage Clustering
Sequence of interactions during live duplicate token scoring, blast radius analysis, and multi-service outage clustering.
Reporter (UI)
IntelligenceCtrl
DuplicateEngine
CorrelationSvc
PostgreSQL
Admin UI
POST /duplicates/check
computeSimilarity(prose)
Jaccard n-gram scan
return Matches: [INC-001 (0.84)]
Render Duplicate Warning Banner
POST /incidents (Confirmed)
INSERT INTO incidents (INC-163, auth_service)
evaluateCascadeClusters()
SELECT service_dependencies
Correlate: Auth Service (4 Downstream)
UPDATE clusters SET affected_users=935
Broadcast Outage Cluster CLUST-001
Duplicate alerts prevent redundant dispatching. When 4 or more downstream services report authentication failures, the correlation engine synthesizes an Enterprise Outage Cluster (CLUST-001) affecting 935 us

---

## Page 37
Diagram 15: Chat Intake — Multi-Turn Dialogue and Advisory Triage
Sequence of interactions during natural language conversational intake, entity extraction, and self-service runbook recommendation.
Employee (Chat)
ChatIntakeCtrl
IntakeAssistant
KnowledgeBase
IncidentSvc
"Can't process payments on portal"
parseIntent & extractEntities()
querySelfServiceArticles("payment")
KB-304 ("Clear browser cookie / SSL cache")
"Try clearing SSL cache (KB-304). Did that fix it?"
"No, server returns 502 Bad Gateway"
Compile Draft: Priority=P1, Svc=Payment
"I drafted Ticket: 'Payment Gateway 502 Outage' (P1). Confirm?"
"Yes, submit it immediately"
createIncident(draftDetails)
Incident Created (INC-161, Tech: Alex)
"Ticket INC-161 submitted. Alex Chen assigned."
Multi-turn chat intake prevents incomplete reports by probing for error codes, attempting self-service deflection, and presenting a structured draft for user confirmation before executing transactional creation.

---

## Page 38
Diagram 16: Admin Assistant — Natural Language Governance Preview and Selected Apply
Sequence of interactions during natural language system configuration, diff generation, and audited execution.
System Admin (UI)
AdminAssistantCtrl
NLInterpreter
AdminChangeSvc
AuditTrailSvc
"Switch dispatch to COMPOSITE and tighten P1 SLA to 2h"
interpretInstruction(prompt)
Generate Proposed Config Diff
return ConfigDiffPreview
Render Side-by-Side Diff Modal (Old vs New)
POST /admin/assistant/apply (diffId, confirmed: true)
applyChanges(diffId, adminUser)
Update Strategy & SLA tables
logGovernanceMutation(admin, diff)
Audit Log Committed
Changes Applied Successfully
Display Green Toast: "System Policies Updated"
Natural language admin queries are strictly advisory and non-destructive until explicit human confirmation. The system enforces the Principle of Least Privilege: all changes require human inspection of the diff pre

---

## Page 39
Diagram 17: Core Relational Entity-Relationship Diagram
Core database tables, primary keys, foreign keys, and cardinalities across the Resolvo relational schema.
departments
PK id: BIGINT
name: VARCHAR(100)
code: VARCHAR(20) [UQ]
business_hours: JSONB
created_at: TIMESTAMP
users
PK id: BIGINT
email: VARCHAR(150) [UQ]
full_name: VARCHAR(100)
role: VARCHAR(30)
FK department_id: BIGINT
is_active: BOOLEAN
created_at: TIMESTAMP
1
0..*
it_services
PK id: BIGINT
name: VARCHAR(100)
code: VARCHAR(30) [UQ]
FK department_id: BIGINT
default_priority: VARCHAR(20)
is_active: BOOLEAN
incidents (Core Ticket)
PK id: BIGINT
ticket_number: VARCHAR(30) [UQ]
title: VARCHAR(200)
description: TEXT
FK reporter_id: BIGINT
FK service_id: BIGINT
status: VARCHAR(30)
priority: VARCHAR(20)
created_at: TIMESTAMP
1
0..*
1
0..*
incident_attachments
PK id: BIGINT
FK incident_id: BIGINT
filename: VARCHAR(255)
file_type: VARCHAR(50)
data_uri: TEXT (Base64)
file_size: BIGINT
1
0..*
sla_targets
PK id: BIGINT
FK incident_id: BIGINT [UQ]
response_due_at: TIMESTAMP
resolution_due_at: TIMESTAMP
responded_at: TIMESTAMP
resolved_at: TIMESTAMP
is_breached: BOOLEAN
1
1
technician_assignments
PK id: BIGINT
FK incident_id: BIGINT
FK technician_id: BIGINT
assigned_at: TIMESTAMP
assigned_by: BIGINT
strategy_used: VARCHAR(50)
audit_logs (Immutable)
PK id: BIGINT
FK incident_id: BIGINT
FK actor_id: BIGINT
action: VARCHAR(50)
previous_state: VARCHAR(30)
new_state: VARCHAR(30)

---

## Page 40
Diagram 18: Complete Relational Schema Table Dictionary
Exhaustive dictionary of all 13 Flyway-migrated tables (V1 through V4) with row counts and integrity constraints.
Physical Table Name
Primary Key
Key Foreign Keys & Uniqueness
Migration Version
Functional Role & Integrity
Guarantee
users
id (BIGINT)
email [UQ] , dept_id →
departments
V1__initial_schema
Stores authenticated personas,
role permissions, and active
capacity.
departments
id (BIGINT)
code [UQ]
V1__initial_schema
Multi-tenant organizational
divisions with separate service
queues.
it_services
id (BIGINT)
code [UQ] , dept_id →
departments
V1__initial_schema
Enterprise service catalogue
items with default priority
bindings.
service_categories
id (BIGINT)
service_id → it_services
V1__initial_schema
Granular sub-service categories
for accurate skill tag matching.
service_dependencies
id (BIGINT)
upstream_id , downstream_id
V2__intelligence
Directed acyclic graph tracking
upstream component failure
cascades.
incidents
id (BIGINT)
ticket_number [UQ] ,
reporter_id , svc_id
V1__initial_schema
Root incident aggregate entity
holding lifecycle state and
metadata.
incident_attachments
id (BIGINT)
incident_id → incidents
V4__attachments
Base64 error screenshots and
diagnostic logs (up to 5MB
payload).
technician_assignments
id (BIGINT)
incident_id , technician_id
V1__initial_schema
Historical dispatch log capturing
strategy code and scoring
rationale.
technician_skills
(tech_id,
skill)
technician_id → users
V1__initial_schema
Skill tags used by Jaccard
strategy for intelligent workload
dispatch.
sla_policies
id (BIGINT)
(service_id, priority) [UQ]
V1__initial_schema
Contractual response and
resolution hour targets per
priority.
sla_targets
id (BIGINT)
incident_id [UQ] → incidents
V1__initial_schema
Per-ticket commitment clock
tracking deadlines and breach
flags.
audit_logs
id (BIGINT)
incident_id , actor_id → users
V1__initial_schema
Append-only, immutable audit
trail tracking all state transitions.
infrastructure_clusters
id (BIGINT)
cluster_code [UQ] ,
root_service_id
V2__intelligence
Correlated multi-service outage
clusters and calculated blast
radius.
Relational Consistency & Indexing Strategy:
Composite B-tree indexes are established on (status, priority) and (technician_id, status) to ensure constant-time O(1) technician
workload lookups during burst assignment loops. Foreign keys enforce referential integrity with ON DELETE RESTRICT on historical audits and
incident records, preventing accidental data loss.

---

## Page 41
Diagram 19: Production Cloud Deployment Architecture (AWS Runbook)
Production-grade AWS cloud hosting topology with automated TLS termination, private RDS VPC, and secret parameter management.
Public Internet / Client Browsers (HTTPS:443)
AWS Route 53 (DNS / Anycast)
AWS Virtual Private Cloud (VPC: 10.0.0.0/16) · Region: ap-south-1 (Mumbai)
Public Subnet (10.0.1.0/24) · AWS EC2 t3.medium
Caddy / Nginx
Auto Let's Encrypt TLS
Gzip / HTTP/2
React 18 SPA
Vite static bundle
Tailwind CSS assets
Spring Boot 3.3.5 (Java 21 JAR)
Embedded Tomcat · Port 8080 · systemd service
Private Subnet (10.0.2.0/24) · Isolated
AWS RDS PostgreSQL 16
db.t4g.small · Multi-AZ Replication
Automated Daily Backups & TLS 1.3
AWS S3 / Relational Blob Store
Encrypted AES-256 screenshot & log store
Security & Operational Governance Services
AWS Systems Manager (SSM)
• Parameter Store
• Secure DB Password
• Zero hardcoded secrets
• Auto key rotation
AWS CloudWatch
• Live JVM Metrics (Micrometer)
• Access & Error Log Streams
• SLA Breach Alert Alarms
• P99 Latency Monitoring
GitHub Actions CI/CD
• Automated mvn test & npm test
• 125 Automated tests gate
• SSH deployment to EC2
• Zero-downtime rolling reload

---
