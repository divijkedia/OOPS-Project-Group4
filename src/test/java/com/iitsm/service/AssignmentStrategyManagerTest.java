package com.iitsm.service;

import com.iitsm.domain.strategy.AssignmentStrategy;
import com.iitsm.domain.strategy.LoadBasedAssignment;
import com.iitsm.domain.strategy.RoundRobinAssignment;
import com.iitsm.domain.strategy.SkillBasedAssignment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Service: Assignment Strategy Manager")
class AssignmentStrategyManagerTest {

    private AssignmentStrategyManager manager;
    private SkillBasedAssignment skillStrategy;
    private LoadBasedAssignment loadStrategy;
    private RoundRobinAssignment roundRobinStrategy;

    @BeforeEach
    void setUp() {
        skillStrategy = new SkillBasedAssignment();
        loadStrategy = new LoadBasedAssignment();
        roundRobinStrategy = new RoundRobinAssignment();

        manager = new AssignmentStrategyManager(List.of(skillStrategy, loadStrategy, roundRobinStrategy));
    }

    @Test
    @DisplayName("Should default to SKILL_BASED assignment strategy")
    void shouldDefaultToSkillBased() {
        assertEquals("SKILL_BASED", manager.getActiveStrategyName());
        assertInstanceOf(SkillBasedAssignment.class, manager.getActiveStrategy());
    }

    @Test
    @DisplayName("Should dynamically switch active strategy at runtime")
    void shouldSwitchStrategyDynamically() {
        manager.setActiveStrategy("LOAD_BASED");
        assertEquals("LOAD_BASED", manager.getActiveStrategyName());
        assertInstanceOf(LoadBasedAssignment.class, manager.getActiveStrategy());

        manager.setActiveStrategy("ROUND_ROBIN");
        assertEquals("ROUND_ROBIN", manager.getActiveStrategyName());
        assertInstanceOf(RoundRobinAssignment.class, manager.getActiveStrategy());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when attempting to switch to an unknown strategy")
    void shouldThrowOnUnknownStrategy() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manager.setActiveStrategy("NON_EXISTENT_STRATEGY")
        );
        assertTrue(ex.getMessage().contains("Unknown assignment strategy"));
    }
}
