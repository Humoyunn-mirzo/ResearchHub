package com.researchhub.backend.messaging;

import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.student.Student;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserRepository;
import com.researchhub.backend.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private static final int PREVIEW_MAX = 200;

    private final MessageConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public ConversationSummaryResponse getOrCreateConversation(UUID participantId) {
        User me = currentUserService.getCurrentUser();
        requireStudentOrProfessor(me);
        if (participantId == null || participantId.equals(me.getId())) {
            throw new IllegalArgumentException("Invalid participant.");
        }
        User other = userRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        boolean meStudent = me instanceof Student;
        boolean meProfessor = me instanceof Professor;
        boolean otherStudent = other instanceof Student;
        boolean otherProfessor = other instanceof Professor;

        if (!((meStudent && otherProfessor) || (meProfessor && otherStudent))) {
            throw new IllegalArgumentException("You can only message between a student and a professor.");
        }

        UUID studentId = meStudent ? me.getId() : other.getId();
        UUID professorId = meProfessor ? me.getId() : other.getId();

        MessageConversation conv = conversationRepository.findByStudent_IdAndProfessor_Id(studentId, professorId)
                .orElseGet(() -> {
                    User s = userRepository.findById(studentId).orElseThrow();
                    User p = userRepository.findById(professorId).orElseThrow();
                    MessageConversation c = new MessageConversation();
                    c.setStudent(s);
                    c.setProfessor(p);
                    return conversationRepository.save(c);
                });

        return toSummary(conv, me.getId());
    }

    @Transactional(readOnly = true)
    public Page<ConversationSummaryResponse> listConversations(Pageable pageable) {
        User me = currentUserService.getCurrentUser();
        requireStudentOrProfessor(me);
        Page<MessageConversation> page = conversationRepository.findForParticipant(me.getId(), pageable);
        return page.map(c -> toSummary(c, me.getId()));
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> listMessages(UUID conversationId, Pageable pageable) {
        User me = currentUserService.getCurrentUser();
        requireStudentOrProfessor(me);
        MessageConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found."));
        assertParticipant(conv, me.getId());

        Page<Message> messages = messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId, pageable);
        return messages.map(m -> new MessageResponse(
                m.getId(),
                conv.getId(),
                m.getSender().getId(),
                m.getBody(),
                m.getCreatedAt()
        ));
    }

    @Transactional
    public MessageResponse sendMessage(UUID conversationId, String body) {
        User me = currentUserService.getCurrentUser();
        requireStudentOrProfessor(me);
        MessageConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found."));
        assertParticipant(conv, me.getId());

        String trimmed = body == null ? "" : body.trim();
        if (trimmed.isEmpty() || trimmed.length() > 5000) {
            throw new IllegalArgumentException("Message must be between 1 and 5000 characters.");
        }

        Message msg = new Message();
        msg.setConversation(conv);
        msg.setSender(me);
        msg.setBody(trimmed);
        msg = messageRepository.save(msg);

        conv.setUpdatedAt(OffsetDateTime.now());
        conversationRepository.save(conv);

        return new MessageResponse(
                msg.getId(),
                conv.getId(),
                me.getId(),
                msg.getBody(),
                msg.getCreatedAt()
        );
    }

    @Transactional
    public void markRead(UUID conversationId) {
        User me = currentUserService.getCurrentUser();
        requireStudentOrProfessor(me);
        MessageConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found."));
        assertParticipant(conv, me.getId());

        OffsetDateTime now = OffsetDateTime.now();
        if (conv.getStudent().getId().equals(me.getId())) {
            conv.setStudentLastReadAt(now);
        } else {
            conv.setProfessorLastReadAt(now);
        }
        conversationRepository.save(conv);
    }

    private void requireStudentOrProfessor(User me) {
        if (!(me instanceof Student) && !(me instanceof Professor)) {
            throw new AccessDeniedException("Messaging is only available for students and professors.");
        }
    }

    private void assertParticipant(MessageConversation conv, UUID userId) {
        if (!conv.getStudent().getId().equals(userId) && !conv.getProfessor().getId().equals(userId)) {
            throw new AccessDeniedException("You are not a participant in this conversation.");
        }
    }

    private ConversationSummaryResponse toSummary(MessageConversation c, UUID viewerId) {
        User other = c.getStudent().getId().equals(viewerId) ? c.getProfessor() : c.getStudent();
        String preview = "";
        OffsetDateTime lastAt = null;
        var lastOpt = messageRepository.findTopByConversation_IdOrderByCreatedAtDesc(c.getId());
        if (lastOpt.isPresent()) {
            Message lm = lastOpt.get();
            String b = lm.getBody();
            preview = b.length() > PREVIEW_MAX ? b.substring(0, PREVIEW_MAX) + "…" : b;
            lastAt = lm.getCreatedAt();
        }

        return new ConversationSummaryResponse(
                c.getId(),
                toPartyInfo(other),
                preview,
                lastAt,
                unreadCount(c, viewerId)
        );
    }

    private long unreadCount(MessageConversation c, UUID meId) {
        UUID otherSenderId = c.getStudent().getId().equals(meId)
                ? c.getProfessor().getId()
                : c.getStudent().getId();
        OffsetDateTime lastRead = c.getStudent().getId().equals(meId)
                ? c.getStudentLastReadAt()
                : c.getProfessorLastReadAt();
        if (lastRead == null) {
            return messageRepository.countByConversation_IdAndSender_Id(c.getId(), otherSenderId);
        }
        return messageRepository.countByConversation_IdAndSender_IdAndCreatedAtAfter(
                c.getId(), otherSenderId, lastRead);
    }

    private PartyInfoResponse toPartyInfo(User u) {
        String role;
        if (u instanceof Professor) {
            role = "PROFESSOR";
        } else if (u instanceof Student) {
            role = "STUDENT";
        } else {
            role = "USER";
        }
        return new PartyInfoResponse(u.getId(), u.getName(), u.getEmail(), role);
    }
}
