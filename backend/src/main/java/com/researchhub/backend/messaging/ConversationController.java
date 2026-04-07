package com.researchhub.backend.messaging;

import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.common.ApiResponsePage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<ApiResponsePage<ConversationSummaryResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<ConversationSummaryResponse> result = messageService.listConversations(pageable);
        return ResponseEntity.ok(new ApiResponsePage<>(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConversationSummaryResponse>> startOrGet(
            @Valid @RequestBody StartConversationRequest request) {
        ConversationSummaryResponse summary = messageService.getOrCreateConversation(request.getParticipantId());
        return ResponseEntity.ok(new ApiResponse<>(summary));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponsePage<MessageResponse>> listMessages(
            @PathVariable("id") UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> result = messageService.listMessages(conversationId, pageable);
        return ResponseEntity.ok(new ApiResponsePage<>(result));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> send(
            @PathVariable("id") UUID conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse msg = messageService.sendMessage(conversationId, request.getBody());
        return ResponseEntity.ok(new ApiResponse<>(msg));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable("id") UUID conversationId) {
        messageService.markRead(conversationId);
        return ResponseEntity.noContent().build();
    }
}
