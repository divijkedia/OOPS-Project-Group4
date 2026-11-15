package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.BusinessCriticality;

public record ItServiceResponse(
        Long id,
        String name,
        String description,
        BusinessCriticality businessCriticality,
        boolean active
) {
}
