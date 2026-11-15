package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.Role;

public record AuthResponse(
        String token,
        String type,
        Long userId,
        String username,
        String fullName,
        Role role
) {
    public AuthResponse(String token, Long userId, String username, String fullName, Role role) {
        this(token, "Bearer", userId, username, fullName, role);
    }
}
