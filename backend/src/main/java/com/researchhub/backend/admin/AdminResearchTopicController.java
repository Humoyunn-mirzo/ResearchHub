package com.researchhub.backend.admin;

import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.topic.CreateResearchTopicRequest;
import com.researchhub.backend.topic.ResearchTopicResponse;
import com.researchhub.backend.topic.ResearchTopicService;
import com.researchhub.backend.topic.UpdateResearchTopicRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/research-topics")
@RequiredArgsConstructor
@Validated
public class AdminResearchTopicController {

    private final ResearchTopicService researchTopicService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResearchTopicResponse>>> list() {
        return ResponseEntity.ok(new ApiResponse<>(researchTopicService.findAllOrdered()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResearchTopicResponse>> create(@Valid @RequestBody CreateResearchTopicRequest request) {
        ResearchTopicResponse created = researchTopicService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ResearchTopicResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateResearchTopicRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(researchTopicService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        researchTopicService.delete(id);
    }
}
