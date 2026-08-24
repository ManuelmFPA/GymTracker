package com.gymtracker.dto.workout;

import java.time.LocalDateTime;

public record SetResponse(
        Long id,
        Integer setNumber,
        Double weight,
        Integer repetitions,
        Double rpe,
        String status,
        LocalDateTime completedAt,
        String notes
) {}
