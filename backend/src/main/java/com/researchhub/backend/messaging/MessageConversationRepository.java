package com.researchhub.backend.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface MessageConversationRepository extends JpaRepository<MessageConversation, UUID> {

    Optional<MessageConversation> findByStudent_IdAndProfessor_Id(UUID studentId, UUID professorId);

    @Query("""
            SELECT c FROM MessageConversation c
            WHERE c.student.id = :userId OR c.professor.id = :userId
            """)
    Page<MessageConversation> findForParticipant(@Param("userId") UUID userId, Pageable pageable);
}
