package com.gymtracker.dto.exercise;

import jakarta.validation.constraints.NotBlank;

public record ExerciseRequest(
        @NotBlank(message = "El nombre es obligatorio") String name,
        @NotBlank(message = "El grupo muscular es obligatorio") String muscleGroup,
        String primaryMuscle,
        String equipment,
        String description,
        String instructions,
        String imageUrl,
        String videoUrl
) {}
