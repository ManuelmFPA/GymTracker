package com.gymtracker.controller;

import com.gymtracker.dto.workout.*;
import com.gymtracker.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping
    public ResponseEntity<WorkoutResponse> start(@RequestBody StartWorkoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutService.start(request));
    }

    @GetMapping("/active")
    public WorkoutResponse getActive() {
        return workoutService.getActive();
    }

    @GetMapping("/{id}")
    public WorkoutResponse getById(@PathVariable Long id) {
        return workoutService.getById(id);
    }

    @GetMapping
    public List<WorkoutResponse> getHistory() {
        return workoutService.getHistory();
    }

    @PostMapping("/{id}/exercises/{workoutExerciseId}/sets")
    public WorkoutResponse upsertSet(@PathVariable Long id, @PathVariable Long workoutExerciseId,
                                      @Valid @RequestBody SetRequest request) {
        return workoutService.upsertSet(id, workoutExerciseId, request);
    }

    @DeleteMapping("/{id}/exercises/{workoutExerciseId}/sets/{setId}/complete")
    public WorkoutResponse undoSet(@PathVariable Long id, @PathVariable Long workoutExerciseId,
                                    @PathVariable Long setId) {
        return workoutService.undoSet(id, workoutExerciseId, setId);
    }

    @PutMapping("/{id}/finish")
    public WorkoutResponse finish(@PathVariable Long id, @RequestBody(required = false) FinishWorkoutRequest request) {
        return workoutService.finish(id, request);
    }

    @PutMapping("/{id}/cancel")
    public WorkoutResponse cancel(@PathVariable Long id) {
        return workoutService.cancel(id);
    }

    @PutMapping("/{id}/pause")
    public WorkoutResponse pause(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean paused) {
        return workoutService.setPaused(id, paused);
    }
}
