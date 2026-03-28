package com.researchhub.backend.topic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface ResearchTopicRepository extends JpaRepository<ResearchTopic, UUID> {

    boolean existsByName(String name);

    Optional<ResearchTopic> findByName(String name);

    long countByNameIn(Collection<String> names);

    @Query(value = "SELECT COUNT(*) FROM project_tags WHERE tag = :name", nativeQuery = true)
    long countUsageOnProjects(@Param("name") String name);

    @Modifying
    @Query(value = "UPDATE project_tags SET tag = :newName WHERE tag = :oldName", nativeQuery = true)
    int renameOnProjects(@Param("oldName") String oldName, @Param("newName") String newName);
}
