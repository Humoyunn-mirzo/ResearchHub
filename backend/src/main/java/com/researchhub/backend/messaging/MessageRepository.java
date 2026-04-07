package com.researchhub.backend.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByConversation_IdOrderByCreatedAtAsc(UUID conversationId, Pageable pageable);

    Optional<Message> findTopByConversation_IdOrderByCreatedAtDesc(UUID conversationId);

    long countByConversation_IdAndSender_Id(UUID conversationId, UUID senderId);

    long countByConversation_IdAndSender_IdAndCreatedAtAfter(
            UUID conversationId, UUID senderId, OffsetDateTime after);
}
