package com.iitsm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application entry point for the Resolvo - Intelligent IT Service Management System backend.
 * Bootstraps the Spring context, scheduling, and JPA repositories.
 */
@SpringBootApplication
@EnableScheduling
public class IitsmApplication {

    public static void main(String[] args) {
        SpringApplication.run(IitsmApplication.class, args);
    }
}
