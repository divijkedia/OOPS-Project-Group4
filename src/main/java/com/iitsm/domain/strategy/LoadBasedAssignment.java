package com.iitsm.domain.strategy;

import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.Technician;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.PriorityQueue;

/**
 * Strategy Pattern Implementation: Assigns the technician with the lowest active incident count.
 * Uses a PriorityQueue (min-heap) data structure to order candidates by active workload ascending,
 * breaking ties by highest experience level.
 */
@Component("loadBasedAssignment")
public class LoadBasedAssignment implements AssignmentStrategy {

    public static final String STRATEGY_NAME = "LOAD_BASED";

    @Override
    public String getName() {
        return STRATEGY_NAME;
    }

    @Override
    public String getDescription() {
        return "Assigns technician with the least active workload, breaking ties by seniority";
    }

    @Override
    public Optional<Technician> assign(Incident incident, List<Technician> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            return Optional.empty();
        }

        Comparator<Technician> loadComparator = Comparator
                .comparingInt(Technician::getActiveIncidentCount)
                .thenComparing((Technician t) -> t.getExperienceLevel().getWeight(), Comparator.reverseOrder());

        // Min-heap PriorityQueue to pick the least loaded technician in O(log k)
        PriorityQueue<Technician> minHeap = new PriorityQueue<>(loadComparator);

        for (Technician tech : candidates) {
            if (tech.isActive() && tech.canAcceptIncident()) {
                minHeap.offer(tech);
            }
        }

        return Optional.ofNullable(minHeap.poll());
    }
}
