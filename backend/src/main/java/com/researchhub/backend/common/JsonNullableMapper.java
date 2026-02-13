package com.researchhub.backend.common;

import org.mapstruct.Condition;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.stereotype.Component;

@Component
public class JsonNullableMapper {

    public <T> T unwrap(JsonNullable<T> value) {
        if (value == null || !value.isPresent()) {
            return null;
        }
        return value.orElse(null);
    }

    @Condition
    // @Named("isDefined")
    public static <T> boolean isDefined(JsonNullable<T> value) {
        return value != null && value.isPresent();
    }
}
