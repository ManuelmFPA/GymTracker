package com.gymtracker.dto.progress;

import java.util.List;

public record DashboardResponse(
        String userName,
        Double currentWeight,
        Double targetWeight,
        Long workoutsThisWeek,
        Long workoutsThisMonth,
        Double weeklyVolume,
        Double monthlyVolume,
        String lastWorkoutName,
        String lastWorkoutDate,
        List<String> recentPRs,
        List<WeightPointResponse> weightHistory
) {}
