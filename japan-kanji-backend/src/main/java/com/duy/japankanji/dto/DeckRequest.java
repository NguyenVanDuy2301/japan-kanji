package com.duy.japankanji.dto;

import jakarta.validation.constraints.NotBlank;

public record DeckRequest(
        @NotBlank(message = "Title is required")
        String title,
        String description
) {}
