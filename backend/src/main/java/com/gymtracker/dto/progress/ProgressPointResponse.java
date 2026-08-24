package com.gymtracker.dto.progress;

import java.time.LocalDate;

public record ProgressPointResponse(
        LocalDate date,
        Double maxWeight,
        Double volume
) {}
