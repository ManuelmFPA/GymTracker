package com.gymtracker.repository;

import com.gymtracker.entity.WorkoutRoutine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutRoutineRepository extends JpaRepository<WorkoutRoutine, Long> {
    List<WorkoutRoutine> findByUserIdOrderByCreatedAtDesc(Long userId);
}
