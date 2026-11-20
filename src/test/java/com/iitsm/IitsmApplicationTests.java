package com.iitsm;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Verifies that the Spring application context loads successfully
 * with the test profile and Flyway schema migrations executed.
 */
@SpringBootTest
@ActiveProfiles("test")
class IitsmApplicationTests {

    @Test
    @DisplayName("Application context and Flyway migrations bootstrap cleanly")
    void contextLoads() {
    }
}
