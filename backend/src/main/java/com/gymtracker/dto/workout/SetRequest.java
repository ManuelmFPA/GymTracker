package com.gymtracker.dto.workout;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SetRequest(
        @NotNull @Min(1) Integer setNumber,
        @DecimalMin(value = "0.0", message = "El peso no puede ser negativo") Double weight,
        @Min(value = 0, message = "Las repeticiones deben ser positivas") Integer repetitions,
        Double rpe,
        String notes,
        Boolean completed
) {}
