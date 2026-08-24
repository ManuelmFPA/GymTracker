package com.gymtracker.service;

import com.gymtracker.entity.User;
import com.gymtracker.exception.ResourceNotFoundException;
import com.gymtracker.repository.UserRepository;
import com.gymtracker.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/** Resolves the authenticated user from the JWT-populated SecurityContext. Never trust a userId from the client. */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public Long getCurrentUserId() {
        CustomUserDetails details = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return details.getUserId();
    }

    public User getCurrentUser() {
        return userRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
