# Resolvo Entity-Relationship (ER) Diagram

> **Persistence**: Relational Schema (PostgreSQL & H2 In-Memory)
> **Migration Management**: Flyway Database Migrations (`V1__init_schema.sql`, `V2__seed_data.sql`)

```mermaid
erDiagram
    users {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR full_name
        VARCHAR role
        BOOLEAN active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    employees {
        BIGINT user_id PK,FK
        VARCHAR department
        VARCHAR phone
    }

    technicians {
        BIGINT user_id PK,FK
        VARCHAR experience_level
        INT max_workload
        BOOLEAN available
        INT active_incident_count
    }

    administrators {
        BIGINT user_id PK,FK
    }

    technician_skills {
        BIGINT technician_id PK,FK
        VARCHAR skill PK
    }

    it_services {
        BIGINT id PK
        VARCHAR name UK
        TEXT description
        VARCHAR business_criticality
        BOOLEAN active
    }

    incident_categories {
        BIGINT id PK
        VARCHAR name UK
        TEXT description
        TEXT keywords
    }

    incidents {
        BIGINT id PK
        VARCHAR title
        TEXT description
        VARCHAR impact
        VARCHAR urgency
        VARCHAR business_criticality
        VARCHAR priority
        INT priority_score
        VARCHAR status
        BIGINT reporter_id FK
        BIGINT service_id FK
        BIGINT category_id FK
        BIGINT technician_id FK
        INT affected_user_count
        INT response_target_minutes
        INT resolution_target_minutes
        TIMESTAMP response_deadline
        TIMESTAMP resolution_deadline
        TIMESTAMP responded_at
        TIMESTAMP resolved_at
        TIMESTAMP closed_at
        BOOLEAN response_breached
        BOOLEAN resolution_breached
        VARCHAR sla_status
        BIGINT resolved_by_user_id
        TEXT resolution_summary
        TEXT root_cause
        TEXT steps_to_resolve
        INT feedback_rating
        TEXT feedback_comment
        TIMESTAMP feedback_submitted_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    incident_related {
        BIGINT incident_id PK,FK
        BIGINT related_incident_id PK,FK
    }

    investigation_notes {
        BIGINT id PK
        BIGINT incident_id FK
        BIGINT author_id FK
        TEXT content
        TIMESTAMP created_at
    }

    sla_policies {
        BIGINT id PK
        VARCHAR priority
        BIGINT service_id FK
        INT response_target_minutes
        INT resolution_target_minutes
    }

    audit_records {
        BIGINT id PK
        TIMESTAMP timestamp
        BIGINT user_id
        VARCHAR username
        VARCHAR action
        BIGINT incident_id
        VARCHAR previous_state
        VARCHAR new_state
        TEXT description
    }

    notifications {
        BIGINT id PK
        BIGINT recipient_id
        VARCHAR type
        VARCHAR title
        TEXT message
        VARCHAR channel
        BOOLEAN read
        BIGINT incident_id
        TIMESTAMP created_at
    }

    %% Relationships
    users ||--o| employees : "JOINED inheritance (1:1)"
    users ||--o| technicians : "JOINED inheritance (1:1)"
    users ||--o| administrators : "JOINED inheritance (1:1)"
    technicians ||--o{ technician_skills : "has skills"

    employees ||--o{ incidents : "reports"
    technicians ||--o{ incidents : "assigned to"
    it_services ||--o{ incidents : "affected by"
    incident_categories ||--o{ incidents : "classified under"
    it_services ||--o{ sla_policies : "overrides SLA for"

    incidents ||--o{ investigation_notes : "contains"
    incidents ||--o{ incident_related : "relates to"
    incidents ||--o{ audit_records : "tracked in"
    incidents ||--o{ notifications : "generates"
```
