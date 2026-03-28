package com.researchhub.backend.topic;

import com.researchhub.backend.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/research-topics")
@RequiredArgsConstructor
public class ResearchTopicController {

    private final ResearchTopicService researchTopicService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResearchTopicResponse>>> list() {
        return ResponseEntity.ok(new ApiResponse<>(researchTopicService.findAllOrdered()));
    }
}
