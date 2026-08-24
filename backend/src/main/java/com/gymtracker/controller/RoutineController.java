package com.gymtracker.controller;

import com.gymtracker.dto.routine.RoutineRequest;
import com.gymtracker.dto.routine.RoutineResponse;
import com.gymtracker.service.RoutineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routines")
@RequiredArgsConstructor
public class RoutineController {

    private final RoutineService routineService;

    @GetMapping
    public List<RoutineResponse> getAll() {
        return routineService.getMyRoutines();
    }

    @GetMapping("/{id}")
    public RoutineResponse getById(@PathVariable Long id) {
        return routineService.getById(id);
    }

    @PostMapping
    public ResponseEntity<RoutineResponse> create(@Valid @RequestBody RoutineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(routineService.create(request));
    }

    @PutMapping("/{id}")
    public RoutineResponse update(@PathVariable Long id, @Valid @RequestBody RoutineRequest request) {
        return routineService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        routineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<RoutineResponse> duplicate(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(routineService.duplicate(id));
    }
}
