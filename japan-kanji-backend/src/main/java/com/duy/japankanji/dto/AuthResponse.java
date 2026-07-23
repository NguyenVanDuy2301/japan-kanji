package com.duy.japankanji.dto;

public record AuthResponse(
        String token,
        String username,
        Long userId
) {}