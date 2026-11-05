package com.iitsm.domain.model;

import com.iitsm.domain.enums.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

/**
 * System administrator / IT operations manager who configures policies,
 * registers services, manages users, and monitors global SLA compliance.
 * Demonstrates Inheritance specialization of User.
 */
@Entity
@Table(name = "administrators")
@PrimaryKeyJoinColumn(name = "user_id")
public class Administrator extends User {

    public Administrator() {
        super();
    }

    public Administrator(String username, String email, String passwordHash, String fullName) {
        super(username, email, passwordHash, fullName, Role.ADMIN);
    }
}
