package com.iitsm.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Tiered escalation hierarchy adhering to the ITIL incident management escalation matrix:
 * Tier 0: NONE (Standard operations / normal queue)
 * Tier 1: TECHNICIAN (Support Engineer)
 * Tier 2: TEAM_LEAD (Incident Team Lead)
 * Tier 3: SYSTEM_ADMINISTRATOR (Senior Systems Administrator)
 * Tier 4: IT_MANAGER (IT Director / Operations Management)
 */
public enum EscalationLevel {
    NONE("Standard Queue", 0),
    TECHNICIAN("Tier 1 - Support Engineer", 1),
    TEAM_LEAD("Tier 2 - Team Lead", 2),
    SYSTEM_ADMINISTRATOR("Tier 3 - System Administrator", 3),
    IT_MANAGER("Tier 4 - IT Operations Director", 4);

    private final String label;
    private final int tier;

    EscalationLevel(String label, int tier) {
        this.label = label;
        this.tier = tier;
    }

    public String getLabel() {
        return label;
    }

    public int getTier() {
        return tier;
    }

    public EscalationLevel next() {
        return switch (this) {
            case NONE -> TECHNICIAN;
            case TECHNICIAN -> TEAM_LEAD;
            case TEAM_LEAD -> SYSTEM_ADMINISTRATOR;
            case SYSTEM_ADMINISTRATOR, IT_MANAGER -> IT_MANAGER;
        };
    }

    @JsonCreator
    public static EscalationLevel fromString(String value) {
        if (value == null || value.isBlank()) {
            return NONE;
        }
        for (EscalationLevel level : values()) {
            if (level.name().equalsIgnoreCase(value.trim()) || level.label.equalsIgnoreCase(value.trim())) {
                return level;
            }
        }
        return NONE;
    }
}
