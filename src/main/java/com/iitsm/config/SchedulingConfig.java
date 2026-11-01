package com.iitsm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables Spring task scheduling for periodic background jobs such as
 * continuous SLA compliance monitoring.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
