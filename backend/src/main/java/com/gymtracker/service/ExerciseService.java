package com.gymtracker.service;

import com.gymtracker.dto.exercise.ExerciseRequest;
import com.gymtracker.dto.exercise.ExerciseResponse;
import com.gymtracker.entity.Exercise;
import com.gymtracker.entity.User;
import com.gymtracker.exception.ForbiddenException;
import com.gymtracker.exception.ResourceNotFoundException;
import com.gymtracker.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final CurrentUserService currentUserService;

    public List<ExerciseResponse> search(String muscleGroup, String equipment, String query) {
        return exerciseRepository.search(
                        blankToNull(muscleGroup), blankToNull(equipment), blankToNull(query))
                .stream().map(this::toResponse).toList();
    }

    public ExerciseResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public ExerciseResponse create(ExerciseRequest request) {
        User user = currentUserService.getCurrentUser();
        Exercise exercise = Exercise.builder()
                .name(request.name())
                .muscleGroup(request.muscleGroup())
                .primaryMuscle(request.primaryMuscle())
                .equipment(request.equipment())
                .description(request.description())
                .instructions(request.instructions())
                .imageUrl(request.imageUrl())
                .videoUrl(request.videoUrl())
                .active(true)
                .createdBy(user)
                .build();
        return toResponse(exerciseRepository.save(exercise));
    }

    public ExerciseResponse update(Long id, ExerciseRequest request) {
        Exercise exercise = findEntity(id);
        assertOwnedOrSystemEditable(exercise);

        exercise.setName(request.name());
        exercise.setMuscleGroup(request.muscleGroup());
        exercise.setPrimaryMuscle(request.primaryMuscle());
        exercise.setEquipment(request.equipment());
        exercise.setDescription(request.description());
        exercise.setInstructions(request.instructions());
        exercise.setImageUrl(request.imageUrl());
        exercise.setVideoUrl(request.videoUrl());

        return toResponse(exerciseRepository.save(exercise));
    }

    public void deactivate(Long id) {
        Exercise exercise = findEntity(id);
        assertOwnedOrSystemEditable(exercise);
        exercise.setActive(false);
        exerciseRepository.save(exercise);
    }

    private void assertOwnedOrSystemEditable(Exercise exercise) {
        if (exercise.getCreatedBy() != null
                && !exercise.getCreatedBy().getId().equals(currentUserService.getCurrentUserId())) {
            throw new ForbiddenException("No puedes modificar un ejercicio creado por otro usuario");
        }
    }

    private Exercise findEntity(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    private ExerciseResponse toResponse(Exercise e) {
        return new ExerciseResponse(
                e.getId(), e.getName(), e.getMuscleGroup(), e.getPrimaryMuscle(),
                e.getEquipment(), e.getDescription(), e.getInstructions(),
                e.getImageUrl(), e.getVideoUrl(), e.getActive(), e.getCreatedBy() != null
        );
    }
}
