-- V2__seed_data.sql: Seed data for I-ITSM

-- BCrypt hash for 'password123': $2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2
-- (Verified standard 10-round BCrypt hash)

-- 1. USERS
-- Administrators
INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (1, 'admin', 'admin@iitsm.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'System Administrator', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (2, 'it_manager', 'manager@iitsm.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'IT Operations Manager', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Technicians
INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (3, 'tech_alice', 'alice.tech@iitsm.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'Alice Smith', 'TECHNICIAN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (4, 'tech_bob', 'bob.tech@iitsm.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'Bob Jones', 'TECHNICIAN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (5, 'tech_carol', 'carol.tech@iitsm.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'Carol White', 'TECHNICIAN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (6, 'tech_david', 'david.tech@iitsm.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'David Brown', 'TECHNICIAN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Employees
INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (7, 'emp_john', 'john.doe@company.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'John Doe', 'EMPLOYEE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (8, 'emp_sarah', 'sarah.connor@company.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'Sarah Connor', 'EMPLOYEE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, username, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (9, 'emp_mike', 'mike.ross@company.local', '$2a$10$3Hi1nb9Jo/WduNp1Fus8Q.MHB0Q0qYYQzeKbACEU5UHsCVm108Fg2', 'Mike Ross', 'EMPLOYEE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Subclass mappings (JOINED inheritance)
INSERT INTO administrators (user_id) VALUES (1);
INSERT INTO administrators (user_id) VALUES (2);

INSERT INTO technicians (user_id, experience_level, max_workload, available, active_incident_count)
VALUES (3, 'SENIOR', 5, true, 0);

INSERT INTO technicians (user_id, experience_level, max_workload, available, active_incident_count)
VALUES (4, 'MID', 5, true, 0);

INSERT INTO technicians (user_id, experience_level, max_workload, available, active_incident_count)
VALUES (5, 'EXPERT', 6, true, 0);

INSERT INTO technicians (user_id, experience_level, max_workload, available, active_incident_count)
VALUES (6, 'JUNIOR', 3, true, 0);

-- Technician Skills
INSERT INTO technician_skills (technician_id, skill) VALUES (3, 'DATABASE');
INSERT INTO technician_skills (technician_id, skill) VALUES (3, 'CLOUD');
INSERT INTO technician_skills (technician_id, skill) VALUES (4, 'NETWORK');
INSERT INTO technician_skills (technician_id, skill) VALUES (4, 'HARDWARE');
INSERT INTO technician_skills (technician_id, skill) VALUES (5, 'SECURITY');
INSERT INTO technician_skills (technician_id, skill) VALUES (5, 'AUTHENTICATION');
INSERT INTO technician_skills (technician_id, skill) VALUES (6, 'SOFTWARE');
INSERT INTO technician_skills (technician_id, skill) VALUES (6, 'APPLICATION');

INSERT INTO employees (user_id, department, phone) VALUES (7, 'Finance', '+1-555-0101');
INSERT INTO employees (user_id, department, phone) VALUES (8, 'Human Resources', '+1-555-0102');
INSERT INTO employees (user_id, department, phone) VALUES (9, 'Legal & Compliance', '+1-555-0103');

-- 2. IT SERVICES
INSERT INTO it_services (id, name, description, business_criticality, active)
VALUES (1, 'Payment Processing Gateway', 'Core merchant and customer payment processing system', 'CRITICAL', true);

INSERT INTO it_services (id, name, description, business_criticality, active)
VALUES (2, 'User Authentication Service', 'Single Sign-On (SSO) and Directory authentication', 'CRITICAL', true);

INSERT INTO it_services (id, name, description, business_criticality, active)
VALUES (3, 'Customer Database', 'Primary customer relational database cluster', 'HIGH', true);

INSERT INTO it_services (id, name, description, business_criticality, active)
VALUES (4, 'Corporate Email Service', 'Enterprise messaging and calendar infrastructure', 'HIGH', true);

INSERT INTO it_services (id, name, description, business_criticality, active)
VALUES (5, 'Internal File Storage', 'Network-attached storage and shared drives', 'MEDIUM', true);

INSERT INTO it_services (id, name, description, business_criticality, active)
VALUES (6, 'Workplace Chat Application', 'Internal team collaboration messaging tool', 'LOW', true);

-- 3. INCIDENT CATEGORIES
INSERT INTO incident_categories (id, name, description, keywords)
VALUES (1, 'Hardware', 'Physical computer, display, peripheral, or server faults', 'laptop,screen,keyboard,mouse,monitor,printer,physical,disk,ram,cpu');

INSERT INTO incident_categories (id, name, description, keywords)
VALUES (2, 'Software', 'Operating system, desktop applications, and library bugs', 'install,crash,bug,update,version,freeze,patch,driver');

INSERT INTO incident_categories (id, name, description, keywords)
VALUES (3, 'Network', 'Connectivity, latency, DNS, firewall, or router issues', 'wifi,internet,connection,vpn,dns,slow,latency,bandwidth,router,switch');

INSERT INTO incident_categories (id, name, description, keywords)
VALUES (4, 'Database', 'Data access, queries, corruption, connection pool, or lock issues', 'sql,query,deadlock,timeout,postgres,migration,corruption,table,index');

INSERT INTO incident_categories (id, name, description, keywords)
VALUES (5, 'Cloud', 'Cloud infrastructure, container, and orchestration issues', 'aws,azure,docker,kubernetes,deployment,cluster,pod,cloud,container');

INSERT INTO incident_categories (id, name, description, keywords)
VALUES (6, 'Security', 'Malware, phishing, security alerts, certificates, and compliance', 'breach,malware,virus,phishing,certificate,ssl,firewall,vulnerability,attack');

INSERT INTO incident_categories (id, name, description, keywords)
VALUES (7, 'Authentication', 'Login failures, lockouts, MFA/2FA, and SSO token errors', 'login,sso,password,token,mfa,2fa,unauthorized,credential,access denied');

INSERT INTO incident_categories (id, name, description, keywords)
VALUES (8, 'Application', 'Enterprise web applications, business logic, and transaction errors', 'payment,checkout,order,portal,api,transaction,failing,unavailable');

-- 4. SLA POLICIES (Global defaults: service_id IS NULL)
INSERT INTO sla_policies (id, priority, service_id, response_target_minutes, resolution_target_minutes)
VALUES (1, 'P1', NULL, 15, 60);

INSERT INTO sla_policies (id, priority, service_id, response_target_minutes, resolution_target_minutes)
VALUES (2, 'P2', NULL, 30, 240);

INSERT INTO sla_policies (id, priority, service_id, response_target_minutes, resolution_target_minutes)
VALUES (3, 'P3', NULL, 60, 480);

INSERT INTO sla_policies (id, priority, service_id, response_target_minutes, resolution_target_minutes)
VALUES (4, 'P4', NULL, 240, 1440);

-- Specific strict SLA for Payment Processing Gateway (service_id = 1, as documented in PDF page 7)
INSERT INTO sla_policies (id, priority, service_id, response_target_minutes, resolution_target_minutes)
VALUES (5, 'P1', 1, 5, 30);

INSERT INTO sla_policies (id, priority, service_id, response_target_minutes, resolution_target_minutes)
VALUES (6, 'P2', 1, 15, 120);

-- Reset identity sequence counters past seeded IDs to prevent PK collisions on new entity inserts
ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE it_services ALTER COLUMN id RESTART WITH 100;
ALTER TABLE incident_categories ALTER COLUMN id RESTART WITH 100;
ALTER TABLE sla_policies ALTER COLUMN id RESTART WITH 100;

