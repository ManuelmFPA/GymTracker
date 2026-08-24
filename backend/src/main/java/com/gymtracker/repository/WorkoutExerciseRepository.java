package com.gymtracker.repository;

import com.gymtracker.entity.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {

    @Query("""
            SELECT we FROM WorkoutExercise we
            WHERE we.exercise.id = :exerciseId AND we.workout.user.id = :userId
            AND we.workout.status = 'COMPLETED'
            ORDER BY we.workout.startTime DESC
            """)
    List<WorkoutExercise> findHistoryForExercise(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);

    default Optional<WorkoutExercise> findLastForExercise(Long userId, Long exerciseId) {
        List<WorkoutExercise> list = findHistoryForExercise(userId, exerciseId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
