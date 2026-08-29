package com.gymtracker.service;

import com.gymtracker.dto.progress.*;
import com.gymtracker.entity.BodyWeight;
import com.gymtracker.entity.Set;
import com.gymtracker.entity.User;
import com.gymtracker.entity.Workout;
import com.gymtracker.entity.enums.SetType;
import com.gymtracker.entity.enums.WorkoutStatus;
import com.gymtracker.exception.ResourceNotFoundException;
import com.gymtracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final BodyWeightRepository bodyWeightRepository;
    private final WorkoutRepository workoutRepository;
    private final SetRepository setRepository;
    private final ExerciseRepository exerciseRepository;
    private final CurrentUserService currentUserService;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        User user = currentUserService.getCurrentUser();
        Long userId = user.getId();

        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
        LocalDateTime startOfMonth = LocalDateTime.now().minusDays(30);

        long workoutsThisWeek = workoutRepository.countByUserIdAndStatusAndStartTimeAfter(
                userId, WorkoutStatus.COMPLETED, startOfWeek);
        long workoutsThisMonth = workoutRepository.countByUserIdAndStatusAndStartTimeAfter(
                userId, WorkoutStatus.COMPLETED, startOfMonth);

        List<Workout> weekWorkouts = workoutRepository.findCompletedSince(userId, startOfWeek);
        List<Workout> monthWorkouts = workoutRepository.findCompletedSince(userId, startOfMonth);

        double weeklyVolume = weekWorkouts.stream().mapToDouble(this::volumeOf).sum();
        double monthlyVolume = monthWorkouts.stream().mapToDouble(this::volumeOf).sum();

        BodyWeight lastWeight = bodyWeightRepository.findFirstByUserIdOrderByDateDesc(userId);

        Workout lastWorkout = workoutRepository.findByUserIdOrderByStartTimeDesc(userId).stream()
                .filter(w -> w.getStatus() == WorkoutStatus.COMPLETED).findFirst().orElse(null);

        List<WeightPointResponse> weightHistory = bodyWeightRepository.findByUserIdOrderByDateAsc(userId)
                .stream().map(bw -> new WeightPointResponse(bw.getDate(), bw.getWeight())).toList();

        return new DashboardResponse(
                user.getName(),
                lastWeight != null ? lastWeight.getWeight() : null,
                user.getTargetWeight(),
                workoutsThisWeek,
                workoutsThisMonth,
                round(weeklyVolume),
                round(monthlyVolume),
                lastWorkout != null ? lastWorkout.getRoutineNameSnapshot() : null,
                lastWorkout != null ? lastWorkout.getStartTime().format(FMT) : null,
                getRecentPrs(userId),
                weightHistory
        );
    }

    // PRs de los últimos 7 días, en todos los ejercicios que el usuario haya entrenado.
    // Reutiliza el mismo algoritmo de escaneo cronológico de WorkoutService (no se
    // duplica: se marca "record" comparando contra el mejor histórico anterior).
    private List<String> getRecentPrs(Long userId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        Map<Long, List<Set>> byExercise = setRepository.findAllCompletedForUser(userId).stream()
                .collect(Collectors.groupingBy(s -> s.getWorkoutExercise().getExercise().getId()));

        return byExercise.entrySet().stream()
                .flatMap(entry -> {
                    List<Set> sets = entry.getValue();
                    Map<Long, String> prTypeBySetId = WorkoutService.computePrTypes(sets);
                    return sets.stream()
                            .filter(s -> prTypeBySetId.containsKey(s.getId()))
                            .filter(s -> s.getWorkoutExercise().getWorkout().getStartTime().isAfter(sevenDaysAgo))
                            .map(s -> {
                                String exerciseName = s.getWorkoutExercise().getExercise().getName();
                                return exerciseName + ": " + s.getWeight() + "kg x " + s.getRepetitions()
                                        + " (" + prTypeBySetId.get(s.getId()) + ")";
                            });
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ExerciseProgressResponse getExerciseProgress(Long exerciseId) {
        Long userId = currentUserService.getCurrentUserId();
        var exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));

        List<Set> completedSets = setRepository.findAllCompletedForExercise(userId, exerciseId)
                .stream().filter(s -> s.getSetType() != SetType.WARMUP).toList();

        double bestWeight = completedSets.stream().filter(s -> s.getWeight() != null)
                .mapToDouble(Set::getWeight).max().orElse(0);

        int bestReps = completedSets.stream().filter(s -> s.getRepetitions() != null)
                .mapToInt(Set::getRepetitions).max().orElse(0);

        double bestVolume = groupSetsByWorkoutDate(completedSets).values().stream()
                .mapToDouble(sets -> sets.stream()
                        .filter(s -> s.getWeight() != null && s.getRepetitions() != null)
                        .mapToDouble(s -> s.getWeight() * s.getRepetitions()).sum())
                .max().orElse(0);

        String lastDate = completedSets.stream()
                .map(s -> s.getWorkoutExercise().getWorkout().getStartTime())
                .max(Comparator.naturalOrder())
                .map(d -> d.format(FMT)).orElse(null);

        List<ProgressPointResponse> history = groupSetsByWorkoutDate(completedSets).entrySet().stream()
                .map(entry -> {
                    double maxW = entry.getValue().stream().filter(s -> s.getWeight() != null)
                            .mapToDouble(Set::getWeight).max().orElse(0);
                    double vol = entry.getValue().stream()
                            .filter(s -> s.getWeight() != null && s.getRepetitions() != null)
                            .mapToDouble(s -> s.getWeight() * s.getRepetitions()).sum();
                    return new ProgressPointResponse(entry.getKey(), maxW, vol);
                })
                .sorted(Comparator.comparing(ProgressPointResponse::date))
                .toList();

        return new ExerciseProgressResponse(exerciseId, exercise.getName(),
                round(bestWeight), bestReps, round(bestVolume), lastDate, history);
    }

    private Map<LocalDate, List<Set>> groupSetsByWorkoutDate(List<Set> sets) {
        return sets.stream().collect(Collectors.groupingBy(
                s -> s.getWorkoutExercise().getWorkout().getStartTime().toLocalDate()));
    }

    private double volumeOf(Workout workout) {
        return workout.getExercises().stream()
                .flatMap(we -> we.getSets().stream())
                .filter(s -> s.getWeight() != null && s.getRepetitions() != null
                        && s.getStatus().name().equals("COMPLETED")
                        && s.getSetType() != SetType.WARMUP)
                .mapToDouble(s -> s.getWeight() * s.getRepetitions())
                .sum();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
