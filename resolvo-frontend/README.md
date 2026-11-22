# Resolvo Frontend: Intelligent IT Service Management System

> **Course**: CS F213 / MAC F212 Object-Oriented Programming (Semester-I, 2026-2027)
> **Backend**: Spring Boot 3.x (Java 21) REST API at `http://localhost:8080/api`
> **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts

---

## 1. Overview & Visual Aesthetic

Resolvo is an enterprise-grade IT Service Management and Incident Resolution portal built to showcase strict Object-Oriented Programming principles, ITIL service operations, and human-centered design.

### Design System & Theme
Derived directly from the UI design system and component architecture:
- **Base Atmosphere**: Deep Royal Blue (`#09318D` / `.app-royal-bg`) providing a clean dark-mode command center atmosphere.
- **Surface Elevation**: Pure White (`#FFFFFF`) cards and panels with soft shadows for high-contrast readability.
- **Primary Action Accent**: Bubblegum Pink (`#FD91CC` / hover `#FC71BA`) for primary action buttons, active pill tabs, and gauge meter fills.
- **Accessibility**: Conforms to **WCAG AA** contrast guidelines. All interactive elements feature visible keyboard focus rings, semantic labels, and distinct color-coded status badges.

---

## 2. Pre-Seeded Test Credentials

The backend initializes with pre-configured users across all three ITIL roles. Use the one-click **"Quick Fill"** buttons on the Login page (`/login`) for instant viva demonstrations:

| Role | Username | Password | Department / Specialization | Access Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Employee** | `emp_john` | `Password@123` | Engineering | `/employee` |
| **Technician** | `tech_alice` | `Password@123` | Database & Storage (Senior) | `/technician` |
| **Administrator** | `admin` | `Password@123` | Enterprise IT Operations | `/admin` |

---

## 3. Key Features & Role Portals

###  Public Marketing Landing Page (`/`)
- Floating frosted navbar with quick links and authentication shortcuts.
- Hero showcase featuring live preview charts and operational metrics.
- Interactive grid of 8 monitored enterprise IT services.
- Visual 8-step ITIL incident lifecycle roadmap (`Reported` -> `Classified` -> `Assigned` -> `Acknowledged` -> `Investigating` -> `Resolved` -> `Verified` -> `Closed`).
- Role-specific capability highlights and course attribution.

---

###  Employee Portal (`/employee`)
- **Dashboard (`/employee`)**: Personal ticket statistics, active ticket count, resolved count, and quick-report shortcut.
- **Report Incident (`/employee/report`)**:
  - Real-time Jaccard token **Duplicate Detector** alerting users to similar ongoing outages.
  - **Automated Category Suggester** predicting incident category from title & description keywords.
  - Live ITIL priority matrix calculator (`Impact x Urgency x Criticality`).
  - Pre-submission confirmation modal.
- **My Incidents (`/employee/incidents`)**: Multi-filter incident list with search, status tabs, and SLA countdowns.
- **Incident Detail (`/employee/incidents/:id`)**:
  - Visual 8-step ITIL lifecycle stepper.
  - Live SLA resolution countdown timer and breach warnings.
  - Diagnostic note log with ability to post follow-up comments.
  - Post-resolution 5-star satisfaction rating and feedback submission.
  - Ticket reopening action if problems persist.

---

###  Technician Console (`/technician`)
- **Dashboard (`/technician`)**:
  - **Workload Capacity Gauge (`GaugeCard`)**: Circular gauge showing active incident count vs max workload threshold.
  - **On-Duty Availability Toggle**: Real-time switch to pause or resume automated ticket dispatching.
  - **SLA At-Risk Queue**: Priority alert strip highlighting tickets approaching or in breach of target SLA windows.
- **Assigned Incidents (`/technician/incidents`)**: Filterable queue with one-click `Ack` and `Start` action triggers.
- **Incident Investigation Detail (`/technician/incidents/:id`)**:
  - Strict ITIL state machine transitions: `Acknowledge` (`ASSIGNED` only) -> `Start Investigation` (`IN_PROGRESS`) -> `Request More Info` (`WAITING_FOR_USER`).
  - Diagnostic and forensic notes log (`POST /api/incidents/{id}/notes`).
  - **Structured Resolution Modal**: Requires resolution summary, root cause analysis, and remediation steps.
  - **Smart Recommendations Panel**: Real-time multi-factor technician scoring for delegation.
  - **Correlated Incidents Panel**: Identifies shared-symptom duplicate tickets.

---

###  Administrator Suite (`/admin`)
- **Enterprise Operations Center (`/admin`)**:
  - 5 KPI indicator cards: Total Reported, Open & Active, P1 Critical Disruptions, Resolved & Closed, SLA Breaches.
  - **Recharts Analytics**: Priority distribution donut chart, status bar chart, and service impact volume chart.
  - SLA Compliance Rate Gauge (`GaugeCard`) tracking 30-day compliance.
  - Live technician workload & utilization progress bars.
- **All Incidents Operations (`/admin/incidents`)**:
  - Multi-parameter server-side filter toolbar synchronized with URL search params.
  - Assign/Reassign Technician Modal with smart recommendation ranking.
  - Reclassify Incident Category modal.
  - Formal Incident Closure action (`PUT /api/incidents/{id}/close`).
- **User & Technician Governance (`/admin/users`)**:
  - Directory of employees, technicians, and administrators.
  - User creation modal with role-specific fields (departments, technical specializations, max workload limits).
- **Service Catalogs & SLA Policies (`/admin/services`)**:
  - IT Services catalog CRUD with business criticality tiers (`MISSION_CRITICAL`, `BUSINESS_OPERATIONAL`, `ADMINISTRATIVE_SUPPORT`).
  - Incident Categories catalog CRUD with auto-classification keyword tags.
  - SLA Policies configuration table with target response and resolution minute thresholds.
- **Assignment Strategy Switcher (`/admin/strategy`)**:
  - Real-time active algorithm banner.
  - Interactive hot-swap switcher between `SKILL_BASED`, `LOAD_BASED`, and `ROUND_ROBIN` routing patterns.
- **Compliance & Forensics Audit Trail (`/admin/audit`)**:
  - Incident ID query with URL synchronization (`?incidentId=X`).
  - Forensic timeline displaying actor, action, previousState -> newState transitions, and audit logs.
  - One-click JSON export for external ITIL audits.

---

## 4. Resilience & Error Handling

- **Error Boundary (`ErrorBoundary.tsx`)**: Global and route-level React error boundary displaying diagnostics, stack traces, and recovery actions ("Try Again", "Reload Window", "Home").
- **Custom 404 Page (`NotFoundPage.tsx`)**: High-contrast service-mesh themed error page with role-aware return navigation.
- **Offline Network Resilience**: Automatic browser online/offline status detection displaying cached-mode warning banners.

---

## 5. Getting Started & Development

### Prerequisites
- Node.js LTS (v20.x or newer)
- Spring Boot backend running on `http://localhost:8080`

### Setup & Run
```bash
# 1. Navigate to frontend directory
cd resolvo-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# Vite runs at http://localhost:5173 with API proxying to http://localhost:8080
```

### Verification & Testing
```bash
# Run all Vitest unit & integration tests
npm test -- --run

# Run ESLint check
npm run lint

# Run TypeScript compilation and production bundle build
npm run build
```

---

## 6. Architecture & Folder Structure

```
resolvo-frontend/
|--  src/
|   |--  api/               # Axios REST clients (admin, auth, catalog, incidents, reports, technician)
|   |--  auth/              # JWT AuthContext, ProtectedRoute, role guards, useAuth hook
|   |--  components/
|   |   |--  charts/        # GaugeCard, StackedBarCard, AreaLineCard
|   |   |--  common/        # ErrorBoundary
|   |   |--  layout/        # AppShell, NotificationBell, UserMenu
|   |   \--  ui/            # Button, Card, Badge, Modal, Input, Select, Stepper, Toast, Skeleton
|   |--  features/
|   |   |--  admin/         # Dashboard, Incidents, Users, Services, Strategy, Audit
|   |   |--  auth/          # LoginPage, RegisterPage
|   |   |--  common/        # NotFoundPage
|   |   |--  employee/      # Dashboard, ReportIncident, MyIncidents, IncidentDetail
|   |   |--  landing/       # LandingPage, Hero, ServicesGrid, Lifecycle, Roles
|   |   |--  styleguide/    # Design token showcase at /_styleguide
|   |   \--  technician/    # Dashboard, Incidents, IncidentDetail
|   |--  hooks/             # useToast, useOnlineStatus
|   |--  styles/            # tokens.css, index.css
|   \--  types/             # API data contracts (api, auth, incident, notification, report)
```
