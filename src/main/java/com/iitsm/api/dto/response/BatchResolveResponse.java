package com.iitsm.api.dto.response;

import java.util.List;

public record BatchResolveResponse(
        int totalResolved,
        List<Long> resolvedIncidentIds,
        String summary,
        String message
) {
}
