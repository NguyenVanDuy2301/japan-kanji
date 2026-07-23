package com.duy.japankanji.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReviewAnswerRequest(
        @NotNull Long vocabularyId,
        @NotNull @Min(0) @Max(5) Integer quality
) {}