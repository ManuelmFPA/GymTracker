package com.gymtracker.entity;

import com.gymtracker.entity.enums.SetStatus;
import com.gymtracker.entity.enums.SetType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sets", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"workout_exercise_id", "set_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Set {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_exercise_id", nullable = false)
    private WorkoutExercise workoutExercise;

    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    private Double weight;

    private Integer repetitions;

    private Double rpe;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SetStatus status = SetStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "set_type", nullable = false, length = 20)
    @Builder.Default
    private SetType setType = SetType.NORMAL;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    private String notes;
}
