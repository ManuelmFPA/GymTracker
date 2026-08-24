package com.gymtracker.repository;

import com.gymtracker.entity.Workout;
import com.gymtracker.entity.enums.WorkoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findByUserIdOrderByStartTimeDesc(Long userId);

    Optional<Workout> findFirstByUserIdAndStatusOrderByStartTimeDesc(Long userId, WorkoutStatus status);

    @Query("""
            SELECT w FROM Workout w
            WHERE w.user.id = :userId AND w.status = 'COMPLETED'
            AND w.startTime >= :from
            """)
    List<Workout> findCompletedSince(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    long countByUserIdAndStatusAndStartTimeAfter(Long userId, WorkoutStatus status, LocalDateTime after);
}
