package com.gymtracker.controller;

import com.gymtracker.dto.progress.DashboardResponse;
import com.gymtracker.dto.progress.ExerciseProgressResponse;
import com.gymtracker.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping
    public DashboardResponse getDashboard() {
        return progressService.getDashboard();
    }

    @GetMapping("/exercises/{id}")
    public ExerciseProgressResponse getExerciseProgress(@PathVariable("id") Long exerciseId) {
        return progressService.getExerciseProgress(exerciseId);
    }
}
