-- V1__init_schema.sql: Initial schema definition for I-ITSM

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE employees (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(100),
    phone VARCHAR(30)
);

CREATE TABLE technicians (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    experience_level VARCHAR(20) NOT NULL,
    max_workload INT NOT NULL DEFAULT 5,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    active_incident_count INT NOT NULL DEFAULT 0
);

CREATE TABLE administrators (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE technician_skills (
    technician_id BIGINT NOT NULL REFERENCES technicians(user_id) ON DELETE CASCADE,
    skill VARCHAR(50) NOT NULL,
    PRIMARY KEY (technician_id, skill)
);

CREATE TABLE it_services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    business_criticality VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE incident_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    keywords TEXT
);

CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    impact VARCHAR(20) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    business_criticality VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    priority_score INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    reporter_id BIGINT NOT NULL REFERENCES employees(user_id),
    service_id BIGINT NOT NULL REFERENCES it_services(id),
    category_id BIGINT REFERENCES incident_categories(id),
    technician_id BIGINT REFERENCES technicians(user_id),
    affected_user_count INT NOT NULL DEFAULT 1,

    -- SlaTracking embedded
    response_target_minutes INT,
    resolution_target_minutes INT,
    response_deadline TIMESTAMP,
    resolution_deadline TIMESTAMP,
    responded_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    response_breached BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_breached BOOLEAN NOT NULL DEFAULT FALSE,
    sla_status VARCHAR(20) NOT NULL DEFAULT 'ON_TRACK',

    -- Resolution embedded
    resolved_by_id BIGINT REFERENCES users(id),
    resolution_summary TEXT,
    resolution_root_cause TEXT,
    resolution_steps TEXT,

    -- Feedback embedded
    feedback_rating INT,
    feedback_comment TEXT,
    feedback_submitted_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE incident_related (
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    related_incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, related_incident_id)
);

CREATE TABLE investigation_notes (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE sla_policies (
    id BIGSERIAL PRIMARY KEY,
    priority VARCHAR(20) NOT NULL,
    service_id BIGINT REFERENCES it_services(id) ON DELETE CASCADE,
    response_target_minutes INT NOT NULL,
    resolution_target_minutes INT NOT NULL,
    CONSTRAINT uk_sla_priority_service UNIQUE (priority, service_id)
);

CREATE TABLE audit_records (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    user_id BIGINT,
    username VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    incident_id BIGINT,
    previous_state VARCHAR(50),
    new_state VARCHAR(50),
    description TEXT
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    incident_id BIGINT
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_priority ON incidents(priority);
CREATE INDEX idx_incidents_reporter ON incidents(reporter_id);
CREATE INDEX idx_incidents_technician ON incidents(technician_id);
CREATE INDEX idx_incidents_service ON incidents(service_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_audit_incident ON audit_records(incident_id);
