package com.gymtracker.service;

import com.gymtracker.dto.bodyweight.BodyWeightRequest;
import com.gymtracker.dto.bodyweight.BodyWeightResponse;
import com.gymtracker.entity.BodyWeight;
import com.gymtracker.entity.User;
import com.gymtracker.exception.ForbiddenException;
import com.gymtracker.exception.ResourceNotFoundException;
import com.gymtracker.repository.BodyWeightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BodyWeightService {

    private final BodyWeightRepository bodyWeightRepository;
    private final CurrentUserService currentUserService;

    public List<BodyWeightResponse> getHistory() {
        Long userId = currentUserService.getCurrentUserId();
        return bodyWeightRepository.findByUserIdOrderByDateAsc(userId)
                .stream().map(this::toResponse).toList();
    }

    public BodyWeightResponse add(BodyWeightRequest request) {
        User user = currentUserService.getCurrentUser();
        BodyWeight entry = BodyWeight.builder()
                .user(user).weight(request.weight()).date(request.date()).notes(request.notes())
                .build();
        return toResponse(bodyWeightRepository.save(entry));
    }

    public void delete(Long id) {
        BodyWeight entry = bodyWeightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro no encontrado"));
        if (!entry.getUser().getId().equals(currentUserService.getCurrentUserId())) {
            throw new ForbiddenException("No puedes borrar registros de otro usuario");
        }
        bodyWeightRepository.delete(entry);
    }

    private BodyWeightResponse toResponse(BodyWeight bw) {
        return new BodyWeightResponse(bw.getId(), bw.getWeight(), bw.getDate(), bw.getNotes());
    }
}
