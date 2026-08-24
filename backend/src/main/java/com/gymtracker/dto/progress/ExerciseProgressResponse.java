package com.gymtracker.dto.progress;

import java.time.LocalDate;
import java.util.List;

public record ExerciseProgressResponse(
        Long exerciseId,
        String exerciseName,
        Double bestWeight,
        Integer bestReps,
        Double bestVolume,
        String lastWorkoutDate,
        List<ProgressPointResponse> history
) {}
