package com.iitsm.domain.model;

import com.iitsm.domain.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

/**
 * Represents an employee or business user who reports incidents and receives support.
 * Demonstrates Inheritance specialization of the User base class.
 */
@Entity
@Table(name = "employees")
@PrimaryKeyJoinColumn(name = "user_id")
public class Employee extends User {

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "phone", length = 30)
    private String phone;

    public Employee() {
        super();
    }

    public Employee(String username, String email, String passwordHash, String fullName,
                    String department, String phone) {
        super(username, email, passwordHash, fullName, Role.EMPLOYEE);
        this.department = department;
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
