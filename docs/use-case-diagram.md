# Resolvo UML Use Case Diagram

> **System**: Resolvo Intelligent IT Service Management & Incident Resolution System (I-ITSM)  
> **Course**: CS F213 / MAC F212: Object-Oriented Programming (OOP)  
> **Standard**: Course Specification §7 Deliverables (Page 14)

```mermaid
flowchart LR
    %% Actors
    subgraph Actors ["Primary & System Actors"]
        Emp["👤 Employee / Customer"]
        Tech["🛠️ Support Technician"]
        Admin["👔 IT Administrator"]
        Sys["⏱️ Background Engine (SLA & Escalation)"]
    end

    %% Use Cases
    subgraph UC_Emp ["Employee Portal"]
        UC1["Report Incident"]
        UC2["View My Incidents"]
        UC3["Track Real-Time Status & SLA"]
        UC4["Add Clarification Note"]
        UC5["Verify Resolution"]
        UC6["Submit Customer Feedback (1-5★)"]
    end

    subgraph UC_Tech ["Technician Workbench"]
        UC7["View Assigned Queue"]
        UC8["Acknowledge Incident (Stop Response SLA)"]
        UC9["Start Active Investigation"]
        UC10["Add Diagnostic Notes"]
        UC11["View AI Smart Recommendations"]
        UC12["Submit Resolution & Root Cause"]
        UC13["Toggle On-Duty / Off-Duty Availability"]
    end

    subgraph UC_Admin ["Administrative Governance"]
        UC14["Manage IT Services & Categories"]
        UC15["Configure SLA Policies"]
        UC16["Reassign / Unassign Incidents"]
        UC17["Configure Assignment Strategies"]
        UC18["Inspect Immutable Audit Ledger"]
        UC19["Trigger Manual Escalation Sweep"]
        UC20["View SLA & Outage Analytics"]
        UC21["Export Incident CSV Report"]
    end

    subgraph UC_Sys ["Intelligent Automation Engine"]
        UC22["Auto-Classify Category via Keywords"]
        UC23["Multi-Factor Priority Calculation"]
        UC24["Auto-Dispatch via Active Strategy"]
        UC25["Detect Duplicate Tickets"]
        UC26["Correlate Cross-Service Outages"]
        UC27["Continuous SLA Monitor & Auto-Escalate"]
        UC28["Dispatch Multi-Channel Notifications"]
    end

    %% Employee Associations
    Emp --> UC1
    Emp --> UC2
    Emp --> UC3
    Emp --> UC4
    Emp --> UC5
    Emp --> UC6

    %% Technician Associations
    Tech --> UC7
    Tech --> UC8
    Tech --> UC9
    Tech --> UC10
    Tech --> UC11
    Tech --> UC12
    Tech --> UC13

    %% Administrator Associations
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21

    %% System Associations & Includes
    UC1 -.->|<<include>>| UC22
    UC1 -.->|<<include>>| UC23
    UC1 -.->|<<include>>| UC24
    UC1 -.->|<<include>>| UC25
    Sys --> UC26
    Sys --> UC27
    Sys --> UC28

    UC8 -.->|<<trigger>>| UC28
    UC12 -.->|<<trigger>>| UC28
    UC16 -.->|<<trigger>>| UC28
    UC27 -.->|<<trigger>>| UC28
```

---

## Use Case Actor Summary

| Actor | Description | Key Responsibilities |
| :--- | :--- | :--- |
| **Employee / Customer** | End user in an organization consuming enterprise IT services | Reports technical issues, monitors progress, provides supplemental clarifications, verifies resolutions, rates support satisfaction. |
| **Support Technician** | Tier-1 to Tier-3 support engineer with domain specializations | Manages assigned ticket queue, acknowledges incidents to stop response clock, conducts diagnostics, logs investigation notes, resolves root causes, manages personal availability. |
| **IT Administrator** | Operations manager and system administrator | Maintains IT Service Catalog, defines SLA matrices, manages user accounts, overrides ticket assignments or unassigns tickets, switches routing strategies, audits system activities, and reviews organizational MTTR/MTTA reliability metrics. |
| **Background Engine** | Automated continuous scheduler (`@Scheduled`) and domain event bus | Periodically checks SLA deadlines every 30s, identifies approaching breaches, executes multi-tier escalation, calculates outage blast radius clusters, and dispatches in-app/simulated email alerts. |
