package com.gymtracker.service;

import com.gymtracker.dto.routine.RoutineExerciseRequest;
import com.gymtracker.dto.routine.RoutineExerciseResponse;
import com.gymtracker.dto.routine.RoutineRequest;
import com.gymtracker.dto.routine.RoutineResponse;
import com.gymtracker.entity.Exercise;
import com.gymtracker.entity.RoutineExercise;
import com.gymtracker.entity.User;
import com.gymtracker.entity.WorkoutRoutine;
import com.gymtracker.exception.ForbiddenException;
import com.gymtracker.exception.ResourceNotFoundException;
import com.gymtracker.repository.ExerciseRepository;
import com.gymtracker.repository.WorkoutRoutineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoutineService {

    private final WorkoutRoutineRepository routineRepository;
    private final ExerciseRepository exerciseRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<RoutineResponse> getMyRoutines() {
        Long userId = currentUserService.getCurrentUserId();
        return routineRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RoutineResponse getById(Long id) {
        return toResponse(findOwned(id));
    }

    @Transactional
    public RoutineResponse create(RoutineRequest request) {
        User user = currentUserService.getCurrentUser();

        WorkoutRoutine routine = WorkoutRoutine.builder()
                .user(user)
                .name(request.name())
                .description(request.description())
                .build();

        applyExercises(routine, request.exercises());

        return toResponse(routineRepository.save(routine));
    }

    @Transactional
    public RoutineResponse update(Long id, RoutineRequest request) {
        WorkoutRoutine routine = findOwned(id);
        routine.setName(request.name());
        routine.setDescription(request.description());
        routine.getExercises().clear();
        applyExercises(routine, request.exercises());
        return toResponse(routineRepository.save(routine));
    }

    public void delete(Long id) {
        WorkoutRoutine routine = findOwned(id);
        routineRepository.delete(routine);
    }

    @Transactional
    public RoutineResponse duplicate(Long id) {
        WorkoutRoutine original = findOwned(id);
        WorkoutRoutine copy = WorkoutRoutine.builder()
                .user(original.getUser())
                .name(original.getName() + " (copia)")
                .description(original.getDescription())
                .build();

        original.getExercises().forEach(re -> copy.getExercises().add(
                RoutineExercise.builder()
                        .routine(copy)
                        .exercise(re.getExercise())
                        .exerciseOrder(re.getExerciseOrder())
                        .targetSets(re.getTargetSets())
                        .targetRepsMin(re.getTargetRepsMin())
                        .targetRepsMax(re.getTargetRepsMax())
                        .restSeconds(re.getRestSeconds())
                        .build()
        ));

        return toResponse(routineRepository.save(copy));
    }

    private void applyExercises(WorkoutRoutine routine, List<RoutineExerciseRequest> requests) {
        for (RoutineExerciseRequest r : requests) {
            Exercise exercise = exerciseRepository.findById(r.exerciseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado: " + r.exerciseId()));

            routine.getExercises().add(RoutineExercise.builder()
                    .routine(routine)
                    .exercise(exercise)
                    .exerciseOrder(r.exerciseOrder())
                    .targetSets(r.targetSets())
                    .targetRepsMin(r.targetRepsMin())
                    .targetRepsMax(r.targetRepsMax())
                    .restSeconds(r.restSeconds() != null ? r.restSeconds() : 90)
                    .build());
        }
    }

    private WorkoutRoutine findOwned(Long id) {
        WorkoutRoutine routine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rutina no encontrada"));
        if (!routine.getUser().getId().equals(currentUserService.getCurrentUserId())) {
            throw new ForbiddenException("No puedes acceder a rutinas de otro usuario");
        }
        return routine;
    }

    private RoutineResponse toResponse(WorkoutRoutine routine) {
        List<RoutineExerciseResponse> exercises = routine.getExercises().stream()
                .map(re -> new RoutineExerciseResponse(
                        re.getId(), re.getExercise().getId(), re.getExercise().getName(),
                        re.getExercise().getMuscleGroup(), re.getExerciseOrder(), re.getTargetSets(),
                        re.getTargetRepsMin(), re.getTargetRepsMax(), re.getRestSeconds()
                )).toList();

        return new RoutineResponse(routine.getId(), routine.getName(), routine.getDescription(),
                routine.getCreatedAt(), exercises);
    }
}
