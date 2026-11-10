package com.iitsm.domain.strategy;

import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.Technician;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Strategy Pattern Implementation: Distributes assignments cyclically in a fair round-robin order
 * among all available technicians who have not exceeded their max workload.
 */
@Component("roundRobinAssignment")
public class RoundRobinAssignment implements AssignmentStrategy {

    public static final String STRATEGY_NAME = "ROUND_ROBIN";

    private final AtomicInteger counter = new AtomicInteger(0);

    @Override
    public String getName() {
        return STRATEGY_NAME;
    }

    @Override
    public String getDescription() {
        return "Distributes assignments evenly in a cyclical round-robin sequence across available technicians";
    }

    @Override
    public Optional<Technician> assign(Incident incident, List<Technician> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            return Optional.empty();
        }

        List<Technician> eligible = candidates.stream()
                .filter(Technician::isActive)
                .filter(Technician::canAcceptIncident)
                .toList();

        if (eligible.isEmpty()) {
            return Optional.empty();
        }

        int index = Math.abs(counter.getAndIncrement() % eligible.size());
        return Optional.of(eligible.get(index));
    }

    public void resetCounter() {
        this.counter.set(0);
    }
}
