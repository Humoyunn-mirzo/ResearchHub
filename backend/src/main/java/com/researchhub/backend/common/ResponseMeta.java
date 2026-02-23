package com.researchhub.backend.common;

import java.time.Clock;
import java.time.OffsetDateTime;

import lombok.Getter;

@Getter
public class ResponseMeta {
    // Fix later, when doing dependancy injection during testing
    private static Clock clock = Clock.systemUTC();

    private final OffsetDateTime timestamp;

    public ResponseMeta() {
        this.timestamp = OffsetDateTime.now(clock);
    }
}
