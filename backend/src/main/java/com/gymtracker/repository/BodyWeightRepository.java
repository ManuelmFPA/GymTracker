package com.gymtracker.repository;

import com.gymtracker.entity.BodyWeight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BodyWeightRepository extends JpaRepository<BodyWeight, Long> {
    List<BodyWeight> findByUserIdOrderByDateAsc(Long userId);
    BodyWeight findFirstByUserIdOrderByDateDesc(Long userId);
}
