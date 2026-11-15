package com.iitsm.service;

import com.iitsm.domain.strategy.AssignmentStrategy;
import com.iitsm.domain.strategy.SkillBasedAssignment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Service managing interchangeable technician assignment strategies at runtime.
 * Implements dynamic Strategy Pattern switching as required by the specification,
 * enabling administrators to toggle between SKILL_BASED, LOAD_BASED, and ROUND_ROBIN.
 */
@Service
public class AssignmentStrategyManager {

    private static final Logger log = LoggerFactory.getLogger(AssignmentStrategyManager.class);

    private final Map<String, AssignmentStrategy> strategies = new HashMap<>();
    private volatile String activeStrategyName = SkillBasedAssignment.STRATEGY_NAME;

    public AssignmentStrategyManager(List<AssignmentStrategy> strategyList) {
        for (AssignmentStrategy strategy : strategyList) {
            this.strategies.put(strategy.getName().toUpperCase(), strategy);
        }
        log.info("Initialized AssignmentStrategyManager with strategies: {}", strategies.keySet());
    }

    /**
     * Retrieves the currently active technician assignment strategy.
     */
    public AssignmentStrategy getActiveStrategy() {
        AssignmentStrategy strategy = strategies.get(activeStrategyName.toUpperCase());
        if (strategy == null) {
            // Fallback to first available or skill based
            return strategies.values().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No technician assignment strategies registered"));
        }
        return strategy;
    }

    /**
     * Dynamically switches the active assignment strategy at runtime without restarting the application.
     */
    public synchronized void setActiveStrategy(String strategyName) {
        Objects.requireNonNull(strategyName, "Strategy name cannot be null");
        String normalized = strategyName.trim().toUpperCase();
        if (!strategies.containsKey(normalized)) {
            throw new IllegalArgumentException(String.format("Unknown assignment strategy '%s'. Available: %s",
                    strategyName, strategies.keySet()));
        }
        this.activeStrategyName = normalized;
        log.info("Active technician assignment strategy changed to: {}", normalized);
    }

    public String getActiveStrategyName() {
        return activeStrategyName;
    }

    public Collection<AssignmentStrategy> getAvailableStrategies() {
        return Collections.unmodifiableCollection(strategies.values());
    }
}
