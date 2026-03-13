package com.researchhub.backend.admin;

import com.researchhub.backend.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAnalytics() {
        AdminAnalyticsResponse analytics = adminAnalyticsService.getAnalytics();
        return ResponseEntity.ok(new ApiResponse<>(analytics));
    }
}
