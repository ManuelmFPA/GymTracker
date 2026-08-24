package com.gymtracker.dto.bodyweight;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BodyWeightRequest(
        @NotNull @DecimalMin(value = "0.0", inclusive = false, message = "El peso debe ser mayor a 0") Double weight,
        @NotNull LocalDate date,
        String notes
) {}
