package com.gymtracker.dto.progress;

import java.time.LocalDate;

public record WeightPointResponse(
        LocalDate date,
        Double weight
) {}
