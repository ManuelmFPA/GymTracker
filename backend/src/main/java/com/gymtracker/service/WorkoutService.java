package com.gymtracker.service;

import com.gymtracker.dto.workout.*;
import com.gymtracker.entity.*;
import com.gymtracker.entity.enums.SetStatus;
import com.gymtracker.entity.enums.SetType;
import com.gymtracker.entity.enums.WorkoutStatus;
import com.gymtracker.exception.BadRequestException;
import com.gymtracker.exception.ForbiddenException;
import com.gymtracker.exception.ResourceNotFoundException;
import com.gymtracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final WorkoutRoutineRepository routineRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final SetRepository setRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public WorkoutResponse start(StartWorkoutRequest request) {
        User user = currentUserService.getCurrentUser();

        Workout workout = Workout.builder()
                .user(user)
                .startTime(LocalDateTime.now())
                .status(WorkoutStatus.IN_PROGRESS)
                .build();

        if (request.routineId() != null) {
            WorkoutRoutine routine = routineRepository.findById(request.routineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rutina no encontrada"));
            if (!routine.getUser().getId().equals(user.getId())) {
                throw new ForbiddenException("No puedes usar una rutina de otro usuario");
            }
            workout.setRoutine(routine);
            workout.setRoutineNameSnapshot(routine.getName());

            routine.getExercises().stream()
                    .sorted(Comparator.comparing(RoutineExercise::getExerciseOrder))
                    .forEach(re -> workout.getExercises().add(
                            WorkoutExercise.builder()
                                    .workout(workout)
                                    .exercise(re.getExercise())
                                    .exerciseOrder(re.getExerciseOrder())
                                    .routineExerciseId(re.getId())
                                    .targetSets(re.getTargetSets())
                                    .targetRepsMin(re.getTargetRepsMin())
                                    .targetRepsMax(re.getTargetRepsMax())
                                    .restSeconds(re.getRestSeconds())
                                    .build()
                    ));
        } else {
            workout.setRoutineNameSnapshot("Entrenamiento libre");
        }

        return toResponse(workoutRepository.save(workout));
    }

    public WorkoutResponse getActive() {
        Long userId = currentUserService.getCurrentUserId();
        Workout workout = workoutRepository
                .findFirstByUserIdAndStatusOrderByStartTimeDesc(userId, WorkoutStatus.IN_PROGRESS)
                .orElseThrow(() -> new ResourceNotFoundException("No hay entrenamiento activo"));
        return toResponse(workout);
    }

    public WorkoutResponse getById(Long id) {
        return toResponse(findOwned(id));
    }

    public List<WorkoutResponse> getHistory() {
        Long userId = currentUserService.getCurrentUserId();
        return workoutRepository.findByUserIdOrderByStartTimeDesc(userId)
                .stream().filter(w -> w.getStatus() == WorkoutStatus.COMPLETED)
                .map(this::toResponse).toList();
    }

    @Transactional
    public WorkoutResponse addOrUpdateExercise(Long workoutId, Long exerciseId, Integer order,
                                                Integer targetSets, Integer targetRepsMin,
                                                Integer targetRepsMax, Integer restSeconds, Exercise exercise) {
        Workout workout = findOwned(workoutId);
        WorkoutExercise we = WorkoutExercise.builder()
                .workout(workout).exercise(exercise).exerciseOrder(order)
                .targetSets(targetSets).targetRepsMin(targetRepsMin)
                .targetRepsMax(targetRepsMax).restSeconds(restSeconds)
                .build();
        workout.getExercises().add(we);
        return toResponse(workoutRepository.save(workout));
    }

    @Transactional
    public WorkoutResponse upsertSet(Long workoutId, Long workoutExerciseId, SetRequest request) {
        Workout workout = findOwned(workoutId);
        WorkoutExercise we = workout.getExercises().stream()
                .filter(x -> x.getId().equals(workoutExerciseId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado en este entrenamiento"));

        if (request.repetitions() != null && request.repetitions() < 0) {
            throw new BadRequestException("Las repeticiones no pueden ser negativas");
        }
        if (request.weight() != null && request.weight() < 0) {
            throw new BadRequestException("El peso no puede ser negativo");
        }

        Optional<Set> existing = we.getSets().stream()
                .filter(s -> s.getSetNumber().equals(request.setNumber())).findFirst();

        Set set = existing.orElseGet(() -> {
            Set s = Set.builder().workoutExercise(we).setNumber(request.setNumber()).build();
            we.getSets().add(s);
            return s;
        });

        set.setWeight(request.weight());
        set.setRepetitions(request.repetitions());
        set.setRpe(request.rpe());
        set.setNotes(request.notes());

        if (request.setType() != null) {
            try {
                set.setSetType(SetType.valueOf(request.setType()));
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Tipo de serie inválido: " + request.setType());
            }
        } else if (set.getSetType() == null) {
            set.setSetType(SetType.NORMAL);
        }

        if (Boolean.TRUE.equals(request.completed())) {
            set.setStatus(SetStatus.COMPLETED);
            set.setCompletedAt(LocalDateTime.now());
        }

        return toResponse(workoutRepository.save(workout));
    }

    @Transactional
    public WorkoutResponse undoSet(Long workoutId, Long workoutExerciseId, Long setId) {
        Workout workout = findOwned(workoutId);
        WorkoutExercise we = workout.getExercises().stream()
                .filter(x -> x.getId().equals(workoutExerciseId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));
        Set set = we.getSets().stream().filter(s -> s.getId().equals(setId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Serie no encontrada"));
        set.setStatus(SetStatus.PENDING);
        set.setCompletedAt(null);
        return toResponse(workoutRepository.save(workout));
    }

    @Transactional
    public WorkoutResponse finish(Long workoutId, FinishWorkoutRequest request) {
        Workout workout = findOwned(workoutId);
        if (workout.getStatus() != WorkoutStatus.IN_PROGRESS && workout.getStatus() != WorkoutStatus.PAUSED) {
            throw new BadRequestException("El entrenamiento ya fue finalizado o cancelado");
        }
        workout.setEndTime(LocalDateTime.now());
        workout.setDuration(Duration.between(workout.getStartTime(), workout.getEndTime()).getSeconds());
        workout.setStatus(WorkoutStatus.COMPLETED);
        workout.setNotes(request != null ? request.notes() : null);
        return toResponse(workoutRepository.save(workout));
    }

    @Transactional
    public WorkoutResponse cancel(Long workoutId) {
        Workout workout = findOwned(workoutId);
        workout.setStatus(WorkoutStatus.CANCELLED);
        workout.setEndTime(LocalDateTime.now());
        return toResponse(workoutRepository.save(workout));
    }

    @Transactional
    public WorkoutResponse setPaused(Long workoutId, boolean paused) {
        Workout workout = findOwned(workoutId);
        workout.setStatus(paused ? WorkoutStatus.PAUSED : WorkoutStatus.IN_PROGRESS);
        return toResponse(workoutRepository.save(workout));
    }

    private Workout findOwned(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrenamiento no encontrado"));
        if (!workout.getUser().getId().equals(currentUserService.getCurrentUserId())) {
            throw new ForbiddenException("No puedes acceder a entrenamientos de otro usuario");
        }
        return workout;
    }

    double volumeOf(Workout workout) {
        return workout.getExercises().stream()
                .flatMap(we -> we.getSets().stream())
                .filter(s -> s.getStatus() == SetStatus.COMPLETED && s.getWeight() != null && s.getRepetitions() != null)
                .filter(s -> s.getSetType() != SetType.WARMUP)
                .mapToDouble(s -> s.getWeight() * s.getRepetitions())
                .sum();
    }

    private WorkoutResponse toResponse(Workout workout) {
        List<WorkoutExerciseResponse> exercises = workout.getExercises().stream()
                .sorted(Comparator.comparing(WorkoutExercise::getExerciseOrder))
                .map(we -> {
                    List<SetResponse> sets = we.getSets().stream()
                            .sorted(Comparator.comparing(Set::getSetNumber))
                            .map(this::toSetResponse).toList();

                    List<SetResponse> previous = workoutExerciseRepository
                            .findLastForExercise(workout.getUser().getId(), we.getExercise().getId())
                            .filter(prev -> !prev.getId().equals(we.getId()))
                            .map(prev -> prev.getSets().stream()
                                    .filter(s -> s.getStatus() == SetStatus.COMPLETED)
                                    .sorted(Comparator.comparing(Set::getSetNumber))
                                    .map(this::toSetResponse).toList())
                            .orElse(List.of());

                    String best = setRepository.findAllCompletedForExercise(workout.getUser().getId(), we.getExercise().getId())
                            .stream().filter(s -> s.getWeight() != null && s.getSetType() != SetType.WARMUP)
                            .max(Comparator.comparingDouble(Set::getWeight))
                            .map(s -> s.getWeight() + " kg x " + s.getRepetitions())
                            .orElse(null);

                    return new WorkoutExerciseResponse(
                            we.getId(), we.getExercise().getId(), we.getExercise().getName(),
                            we.getExercise().getMuscleGroup(), we.getExerciseOrder(), we.getTargetSets(),
                            we.getTargetRepsMin(), we.getTargetRepsMax(), we.getRestSeconds(),
                            sets, previous, best
                    );
                }).toList();

        return new WorkoutResponse(
                workout.getId(),
                workout.getRoutine() != null ? workout.getRoutine().getId() : null,
                workout.getRoutineNameSnapshot(),
                workout.getStartTime(), workout.getEndTime(), workout.getDuration(),
                workout.getStatus().name(), workout.getNotes(),
                volumeOf(workout), exercises
        );
    }

    private SetResponse toSetResponse(Set s) {
        return new SetResponse(s.getId(), s.getSetNumber(), s.getWeight(), s.getRepetitions(),
                s.getRpe(), s.getStatus().name(), s.getCompletedAt(), s.getNotes(), s.getSetType().name());
    }
}
