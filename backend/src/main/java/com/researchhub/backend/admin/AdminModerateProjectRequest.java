package com.researchhub.backend.admin;

import lombok.Data;

import java.util.List;

@Data
public class AdminModerateProjectRequest {
    private List<String> tags;
    /** OPEN or CLOSED */
    private String status;
}
