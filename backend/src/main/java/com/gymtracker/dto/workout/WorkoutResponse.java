package com.gymtracker.dto.workout;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutResponse(
        Long id,
        Long routineId,
        String routineName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Long durationSeconds,
        String status,
        String notes,
        Double totalVolume,
        List<WorkoutExerciseResponse> exercises
) {}
