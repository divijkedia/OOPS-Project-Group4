package com.iitsm.domain.enums;

/**
 * System roles defining access control and authorization boundaries in Resolvo.
 */
public enum Role {
    EMPLOYEE,
    TECHNICIAN,
    ADMIN;

    public String getAuthority() {
        return "ROLE_" + name();
    }
}
