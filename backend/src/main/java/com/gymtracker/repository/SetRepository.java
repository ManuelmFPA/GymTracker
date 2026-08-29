package com.gymtracker.repository;

import com.gymtracker.entity.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SetRepository extends JpaRepository<Set, Long> {

    List<Set> findByWorkoutExerciseId(Long workoutExerciseId);

    @Query("""
            SELECT s FROM Set s
            WHERE s.workoutExercise.exercise.id = :exerciseId
            AND s.workoutExercise.workout.user.id = :userId
            AND s.status = 'COMPLETED'
            """)
    List<Set> findAllCompletedForExercise(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);

    @Query("""
            SELECT s FROM Set s
            WHERE s.workoutExercise.workout.user.id = :userId
            AND s.status = 'COMPLETED'
            """)
    List<Set> findAllCompletedForUser(@Param("userId") Long userId);

    @Query("""
            SELECT s FROM Set s
            WHERE s.workoutExercise.workout.id = :workoutId
            AND s.status = 'COMPLETED'
            """)
    List<Set> findCompletedByWorkoutId(@Param("workoutId") Long workoutId);
}
