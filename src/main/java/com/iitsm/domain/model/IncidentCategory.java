package com.iitsm.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Data-driven incident category entity (e.g., Network, Database, Security, Hardware).
 * Enables introducing new categories at runtime without modifying application source code.
 * Encapsulates keyword tokens used for automated rule-based incident classification.
 */
@Entity
@Table(name = "incident_categories")
public class IncidentCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "keywords", columnDefinition = "TEXT")
    private String keywords;

    public IncidentCategory() {
    }

    public IncidentCategory(String name, String description, String keywords) {
        this.name = Objects.requireNonNull(name, "Category name cannot be null").trim();
        this.description = description;
        this.keywords = keywords;
    }

    /**
     * Splits comma-separated keywords into tokens for text classification.
     */
    public List<String> getKeywordTokens() {
        if (keywords == null || keywords.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(keywords.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .toList();
    }

    /**
     * Checks whether given text contains any of this category's configured keywords.
     */
    public boolean matchesText(String text) {
        if (text == null || text.isBlank()) return false;
        String lower = text.toLowerCase();
        return getKeywordTokens().stream().anyMatch(lower::contains);
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

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof IncidentCategory that)) return false;
        return Objects.equals(id, that.id) || Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    @Override
    public String toString() {
        return "IncidentCategory{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
