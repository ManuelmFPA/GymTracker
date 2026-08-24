package com.gymtracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "muscle_group", nullable = false, length = 60)
    private String muscleGroup;

    @Column(name = "primary_muscle", length = 60)
    private String primaryMuscle;

    @Column(length = 60)
    private String equipment;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** Null for system/default exercises; set when a user creates a custom exercise. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
