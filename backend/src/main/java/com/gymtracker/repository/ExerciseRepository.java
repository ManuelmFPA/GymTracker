package com.gymtracker.repository;

import com.gymtracker.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    @Query(value = """
            SELECT * FROM exercises e
            WHERE e.active = true
            AND (CAST(:muscleGroup AS text) IS NULL OR e.muscle_group = CAST(:muscleGroup AS text))
            AND (CAST(:equipment AS text) IS NULL OR e.equipment = CAST(:equipment AS text))
            AND (CAST(:search AS text) IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))
            ORDER BY e.muscle_group, e.name
            """, nativeQuery = true)
    List<Exercise> search(@Param("muscleGroup") String muscleGroup,
                           @Param("equipment") String equipment,
                           @Param("search") String search);
}