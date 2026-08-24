package com.gymtracker.dto.routine;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RoutineExerciseRequest(
        @NotNull(message = "El ejercicio es obligatorio") Long exerciseId,
        @NotNull @Min(0) Integer exerciseOrder,
        @NotNull @Min(1) Integer targetSets,
        Integer targetRepsMin,
        Integer targetRepsMax,
        Integer restSeconds
) {}
