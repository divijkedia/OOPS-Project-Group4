package com.iitsm.domain.model;

import com.iitsm.domain.enums.BusinessCriticality;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Objects;

/**
 * Enterprise IT Service (e.g., Payment Gateway, Authentication Service, Customer Database)
 * associated with incidents and SLA policies.
 * BusinessCriticality directly influences the intelligent priority determination algorithm.
 */
@Entity
@Table(name = "it_services")
public class ItService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_criticality", nullable = false, length = 20)
    private BusinessCriticality businessCriticality;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public ItService() {
    }

    public ItService(String name, String description, BusinessCriticality businessCriticality) {
        this.name = Objects.requireNonNull(name, "Service name cannot be null").trim();
        this.description = description;
        this.businessCriticality = Objects.requireNonNull(businessCriticality, "BusinessCriticality cannot be null");
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BusinessCriticality getBusinessCriticality() {
        return businessCriticality;
    }

    public void setBusinessCriticality(BusinessCriticality businessCriticality) {
        this.businessCriticality = businessCriticality;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ItService that)) return false;
        return Objects.equals(id, that.id) || Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    @Override
    public String toString() {
        return "ItService{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", businessCriticality=" + businessCriticality +
                ", active=" + active +
                '}';
    }
}
