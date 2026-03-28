package com.researchhub.backend.topic;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ResearchTopicResponse(UUID id, String name, int sortOrder, OffsetDateTime createdAt) {}
