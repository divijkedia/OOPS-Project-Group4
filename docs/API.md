# Resolvo REST API Specification

> **Base URL**: `http://localhost:8080/api`
> **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`
> **OpenAPI Schema**: `http://localhost:8080/v3/api-docs`
> **Authentication**: All protected endpoints require header: `Authorization: Bearer <jwt-token>`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 User Login
- **Method / Path**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "admin",
  "password": "password123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "userId": 1,
    "username": "admin",
    "fullName": "System Administrator",
    "role": "ADMIN"
  }
}
```

### 1.2 User Registration
- **Method / Path**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "new_technician",
  "email": "tech.new@iitsm.local",
  "password": "securePassword123",
  "fullName": "New Support Tech",
  "role": "TECHNICIAN",
  "department": "Infrastructure",
  "phone": "+1-555-0199",
  "experienceLevel": "SENIOR",
  "maxWorkload": 5,
  "skills": ["DATABASE", "NETWORK"]
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 100,
    "username": "new_technician",
    "email": "tech.new@iitsm.local",
    "fullName": "New Support Tech",
    "role": "TECHNICIAN"
  }
}
```

### 1.3 Current User Profile
- **Method / Path**: `GET /api/auth/me`
- **Access**: Authenticated (`EMPLOYEE`, `TECHNICIAN`, `ADMIN`)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  }
}
```

---

## 2. Incident Management Endpoints (`/api/incidents`)

### 2.1 Report an Incident
- **Method / Path**: `POST /api/incidents`
- **Access**: `EMPLOYEE`, `ADMIN`
- **Request Body**:
```json
{
  "title": "Payment checkout failing with database timeout",
  "description": "Users encountering HTTP 504 during credit card order placement in Postgres",
  "serviceId": 1,
  "categoryId": null,
  "impact": "HIGH",
  "urgency": "CRITICAL",
  "affectedUserCount": 250
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Incident reported successfully",
  "data": {
    "id": 101,
    "title": "Payment checkout failing with database timeout",
    "description": "Users encountering HTTP 504...",
    "priority": "P1",
    "priorityScore": 58,
    "status": "ASSIGNED",
    "affectedUserCount": 250,
    "reporter": { "id": 7, "fullName": "John Doe" },
    "service": { "id": 1, "name": "Payment Gateway Service", "businessCriticality": "CRITICAL" },
    "category": { "id": 4, "name": "Database" },
    "assignedTechnician": { "id": 3, "fullName": "Alice Smith", "experienceLevel": "SENIOR" },
    "slaTracking": {
      "responseTargetMinutes": 5,
      "resolutionTargetMinutes": 30,
      "responseDeadline": "2026-11-06T10:05:00",
      "resolutionDeadline": "2026-11-06T10:30:00",
      "slaStatus": "ON_TRACK"
    }
  }
}
```

### 2.2 List / Search Incidents
- **Method / Path**: `GET /api/incidents`
- **Access**: Authenticated
- **Query Parameters**:
  - `search` (String): Filter across title, description, or ID
  - `status` (Enum): `NEW`, `CLASSIFIED`, `ASSIGNED`, `ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`, `VERIFIED`, `CLOSED`, `REOPENED`
  - `priority` (Enum): `P1`, `P2`, `P3`, `P4`
  - `categoryId` (Long): Filter by incident category
  - `serviceId` (Long): Filter by affected IT service
  - `technicianId` (Long): Filter by assigned technician
  - `slaStatus` (Enum): `ON_TRACK`, `APPROACHING`, `VIOLATED`
  - `from` / `to` (ISO DateTime): Created date range
  - `page` (Integer, default 0), `size` (Integer, default 50), `sort` (String, default `createdAt,desc`)
- **Response** (`200 OK`): Array of `IncidentSummaryResponse`.

### 2.3 Get Incident Details
- **Method / Path**: `GET /api/incidents/{id}`
- **Access**: Authenticated (Access restricted to reporter, assigned technician, or admin).

### 2.4 Incident Lifecycle State Transitions
| Action | Method | Path | Required Role | Payload |
|---|---|---|---|---|
| **Classify** | `PUT` | `/api/incidents/{id}/classify` | `ADMIN` | `{"categoryId": 4}` |
| **Assign Technician** | `PUT` | `/api/incidents/{id}/assign` | `ADMIN` | `{"technicianId": 3}` |
| **Acknowledge** | `POST` | `/api/incidents/{id}/acknowledge` | `TECHNICIAN` | None |
| **Start Investigation** | `POST` | `/api/incidents/{id}/investigate` | `TECHNICIAN` | None |
| **Add Note** | `POST` | `/api/incidents/{id}/notes` | `TECHNICIAN`, `ADMIN` | `{"content": "Found dead lock in table..."}` |
| **Resolve** | `POST` | `/api/incidents/{id}/resolve` | `TECHNICIAN` | `{"summary": "Terminated lock", "rootCause": "Unindexed foreign key", "stepsToResolve": "Killed PID 412"}` |
| **Verify** | `POST` | `/api/incidents/{id}/verify` | `EMPLOYEE`, `ADMIN` | None |
| **Close** | `POST` | `/api/incidents/{id}/close` | `ADMIN` | None |
| **Reopen** | `POST` | `/api/incidents/{id}/reopen` | `EMPLOYEE`, `ADMIN` | `{"reason": "Transactions failing again"}` |
| **Submit Feedback** | `POST` | `/api/incidents/{id}/feedback` | `EMPLOYEE` | `{"rating": 5, "comment": "Fixed fast!"}` |

---

## 3. Intelligent Features Endpoints

### 3.1 Smart Technician Recommendations
- **Method / Path**: `GET /api/incidents/{id}/recommendations`
- **Access**: `ADMIN`, `TECHNICIAN`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "technicianId": 3,
      "fullName": "Alice Smith",
      "experienceLevel": "SENIOR",
      "currentWorkload": 1,
      "maxWorkload": 5,
      "matchScore": 85.0,
      "skillScore": 40.0,
      "capacityScore": 20.0,
      "experienceScore": 15.0,
      "serviceHistoryScore": 10.0,
      "explanation": "Score 85.0 [Skills: 40.0/40, Capacity: 20.0/25, Exp: 15.0/20, History: 10.0/15]"
    }
  ]
}
```

### 3.2 Duplicate & Correlated Incidents Detection
- **Method / Path**: `GET /api/incidents/{id}/duplicates`
- **Access**: Authenticated
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "incidentId": 85,
      "title": "Payment gateway query timeout",
      "similarityScore": 0.58,
      "matchReason": "Jaccard token overlap of 0.58 on service 'Payment Gateway' (Shared terms: database, payment, timeout)"
    }
  ]
}
```

---

## 4. Management Reporting Endpoints (`/api/reports`)

### 4.1 Incident Overview Dashboard
- **Method / Path**: `GET /api/reports/overview`
- **Access**: `ADMIN`, `TECHNICIAN`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "totalIncidents": 42,
    "openIncidents": 14,
    "inProgressIncidents": 6,
    "resolvedIncidents": 18,
    "closedIncidents": 10,
    "slaBreaches": 3,
    "slaComplianceRatePercent": 92.86,
    "countByPriority": { "P1": 4, "P2": 12, "P3": 16, "P4": 10 },
    "countByStatus": { "NEW": 2, "IN_PROGRESS": 6, "RESOLVED": 18, "CLOSED": 10 }
  }
}
```

### 4.2 Technician Workload Report
- **Method / Path**: `GET /api/reports/technicians`
- **Access**: `ADMIN`
- **Response** (`200 OK`): Array of technician workloads, capacities, and utilization percentages.

### 4.3 Service Reliability Analysis Report
- **Method / Path**: `GET /api/reports/services`
- **Access**: `ADMIN`, `TECHNICIAN`
- **Response** (`200 OK`): Array of service incident frequencies, active counts, and SLA breaches.

---

## 5. Administrative Endpoints (`/api/admin`)

- `POST /api/admin/assignment/strategy`: Dynamically switch active assignment strategy (`{"strategy": "LOAD_BASED"}`)
- `GET /api/admin/services` & `POST /api/admin/services`: Manage IT services
- `GET /api/admin/categories` & `POST /api/admin/categories`: Manage Incident categories and keywords
- `GET /api/admin/sla-policies` & `POST /api/admin/sla-policies`: Configure global and service-specific SLA targets

---

## 6. Audit & Notification Endpoints

- `GET /api/audit/incident/{incidentId}`: Full immutable history trail for a specific incident ticket
- `GET /api/notifications`: Current user's notification inbox
- `GET /api/notifications/unread-count`: Count of unread notifications
- `PUT /api/notifications/{id}/read`: Acknowledge and mark notification as read
