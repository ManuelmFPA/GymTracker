package com.gymtracker.dto.routine;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RoutineRequest(
        @NotBlank(message = "El nombre de la rutina es obligatorio") String name,
        String description,
        @NotEmpty(message = "La rutina debe tener al menos un ejercicio")
        @Valid List<RoutineExerciseRequest> exercises
) {}
