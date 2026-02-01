package com.researchhub.backend.common;

import java.time.Clock;
import java.util.List;

import org.springframework.data.domain.Page;

import lombok.Getter;

@Getter
public class ApiResponsePage<T> {
    private final ResponseMeta meta;
    private final ResponsePagination pagination;
    private final List<T> data;

    public ApiResponsePage(Page<T> page) {
        this.meta = new ResponseMeta();
        this.pagination = ResponsePagination.from(page);
        this.data = page.toList();
    }
}
