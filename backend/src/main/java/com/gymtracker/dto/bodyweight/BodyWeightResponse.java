package com.gymtracker.dto.bodyweight;

import java.time.LocalDate;

public record BodyWeightResponse(
        Long id,
        Double weight,
        LocalDate date,
        String notes
) {}
