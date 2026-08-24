package com.gymtracker.dto.workout;

import java.util.List;

public record WorkoutExerciseResponse(
        Long id,
        Long exerciseId,
        String exerciseName,
        String muscleGroup,
        Integer exerciseOrder,
        Integer targetSets,
        Integer targetRepsMin,
        Integer targetRepsMax,
        Integer restSeconds,
        List<SetResponse> sets,
        List<SetResponse> previousSets,
        String bestSetSummary
) {}
