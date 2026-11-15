package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.Priority;

public record SlaPolicyResponse(
        Long id,
        Priority priority,
        Long serviceId,
        String serviceName,
        int responseTargetMinutes,
        int resolutionTargetMinutes,
        boolean isGlobal
) {
}
