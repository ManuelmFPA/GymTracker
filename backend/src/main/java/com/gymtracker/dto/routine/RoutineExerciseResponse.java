package com.gymtracker.dto.routine;

public record RoutineExerciseResponse(
        Long id,
        Long exerciseId,
        String exerciseName,
        String muscleGroup,
        Integer exerciseOrder,
        Integer targetSets,
        Integer targetRepsMin,
        Integer targetRepsMax,
        Integer restSeconds
) {}
