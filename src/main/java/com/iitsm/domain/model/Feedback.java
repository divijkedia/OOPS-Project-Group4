package com.iitsm.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.time.LocalDateTime;

/**
 * Value object (Embeddable) representing user satisfaction feedback submitted
 * following incident resolution or closure.
 */
@Embeddable
public class Feedback {

    @Column(name = "feedback_rating")
    private Integer rating;

    @Column(name = "feedback_comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "feedback_submitted_at")
    private LocalDateTime submittedAt;

    public Feedback() {
    }

    public Feedback(Integer rating, String comment) {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("Feedback rating must be between 1 and 5 (inclusive)");
        }
        this.rating = rating;
        this.comment = comment;
        this.submittedAt = LocalDateTime.now();
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
}
