package com.researchhub.backend.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {

    private long totalUsers;
    private Map<String, Long> usersByRole;
    private long totalProjects;
    private long openProjects;
    private long closedProjects;
    private long totalUniversities;
    private long totalApplications;
    private long pendingApplications;
    private long acceptedApplications;
    private long rejectedApplications;
}
