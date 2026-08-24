package com.gymtracker.dto.routine;

import java.time.LocalDateTime;
import java.util.List;

public record RoutineResponse(
        Long id,
        String name,
        String description,
        LocalDateTime createdAt,
        List<RoutineExerciseResponse> exercises
) {}
