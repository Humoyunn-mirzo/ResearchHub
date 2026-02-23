package com.researchhub.backend.common;

import org.springframework.data.domain.Page;

import lombok.Data;

@Data
public class ResponsePagination {
    private final int number;
    private final int size;
    private final long totalElements;

    public static ResponsePagination from(Page<?> page) {
        return new ResponsePagination(
            page.getNumber(),
            page.getSize(),
            page.getTotalElements()
        );
    }
}
