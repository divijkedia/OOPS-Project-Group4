package com.iitsm.intelligence;

import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.Technician;
import com.iitsm.repository.IncidentRepository;
import com.iitsm.repository.TechnicianRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Intelligent: Multi-factor Smart Technician Recommender")
class SmartTechnicianRecommenderTest {

    @Mock
    private TechnicianRepository technicianRepository;

    @Mock
    private IncidentRepository incidentRepository;

    private SmartTechnicianRecommender recommender;

    @BeforeEach
    void setUp() {
        recommender = new SmartTechnicianRecommender(technicianRepository, incidentRepository);
    }

    @Test
    @DisplayName("Should rank technicians with matching domain skills and capacity ahead of non-matching technicians")
    void shouldRankByMultipleFactors() {
        // Tech 1: Alice (Senior, Database skill, 1 active out of 5)
        Technician alice = new Technician();
        alice.setId(3L);
        alice.setFullName("Alice Smith");
        alice.setExperienceLevel(ExperienceLevel.SENIOR);
        alice.setMaxWorkload(5);
        alice.setActiveIncidentCount(1);
        alice.setAvailable(true);
        alice.setSkills(Set.of("DATABASE", "SQL"));

        // Tech 2: Bob (Mid, Network skill only, 0 active out of 5)
        Technician bob = new Technician();
        bob.setId(4L);
        bob.setFullName("Bob Jones");
        bob.setExperienceLevel(ExperienceLevel.MID);
        bob.setMaxWorkload(5);
        bob.setActiveIncidentCount(0);
        bob.setAvailable(true);
        bob.setSkills(Set.of("NETWORK", "FIREWALL"));

        // Tech 3: Carol (At capacity: 5/5 active)
        Technician carol = new Technician();
        carol.setId(5L);
        carol.setFullName("Carol White");
        carol.setExperienceLevel(ExperienceLevel.EXPERT);
        carol.setMaxWorkload(5);
        carol.setActiveIncidentCount(5);
        carol.setAvailable(true);
        carol.setSkills(Set.of("DATABASE"));

        when(technicianRepository.findByActiveTrueAndAvailableTrue()).thenReturn(List.of(alice, bob, carol));
        when(incidentRepository.findAll()).thenReturn(List.of());

        IncidentCategory dbCategory = new IncidentCategory("Database", "Database faults", "sql,postgres,deadlock");
        ItService dbService = new ItService();
        dbService.setId(3L);
        dbService.setName("Customer Database");

        Incident targetIncident = new Incident();
        targetIncident.setCategory(dbCategory);
        targetIncident.setAffectedService(dbService);

        List<TechnicianRecommendation> recommendations = recommender.recommendTechnicians(targetIncident);

        // Carol should be excluded (at max workload)
        assertEquals(2, recommendations.size());

        // Alice should be ranked #1 due to strong skill relevance (40 pts)
        TechnicianRecommendation top = recommendations.get(0);
        assertEquals(3L, top.technicianId());
        assertEquals("Alice Smith", top.fullName());
        assertEquals(40.0, top.skillScore());
        assertTrue(top.matchScore() > recommendations.get(1).matchScore());

        // Bob should be ranked #2 (lack of DB skills drops him below Alice)
        TechnicianRecommendation second = recommendations.get(1);
        assertEquals(4L, second.technicianId());
        assertEquals("Bob Jones", second.fullName());
    }
}
