package com.gymtracker.dto.exercise;

public record ExerciseResponse(
        Long id,
        String name,
        String muscleGroup,
        String primaryMuscle,
        String equipment,
        String description,
        String instructions,
        String imageUrl,
        String videoUrl,
        boolean active,
        boolean custom
) {}
