package com.gymtracker.controller;

import com.gymtracker.dto.bodyweight.BodyWeightRequest;
import com.gymtracker.dto.bodyweight.BodyWeightResponse;
import com.gymtracker.service.BodyWeightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/body-weight")
@RequiredArgsConstructor
public class BodyWeightController {

    private final BodyWeightService bodyWeightService;

    @GetMapping
    public List<BodyWeightResponse> getHistory() {
        return bodyWeightService.getHistory();
    }

    @PostMapping
    public ResponseEntity<BodyWeightResponse> add(@Valid @RequestBody BodyWeightRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bodyWeightService.add(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bodyWeightService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
