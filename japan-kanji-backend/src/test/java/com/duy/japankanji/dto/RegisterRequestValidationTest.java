package com.duy.japankanji.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RegisterRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    // Trả về true nếu field password của RegisterRequest không vi phạm ràng buộc nào
    private boolean isPasswordValid(String password) {
        RegisterRequest request = new RegisterRequest("john", "john@example.com", password);
        return validator.validate(request).stream()
                .noneMatch(v -> v.getPropertyPath().toString().equals("password"));
    }

    @Test
    void password_withLettersAndDigitsAndEightChars_isValid() {
        assertThat(isPasswordValid("abc12345")).isTrue();
    }

    @Test
    void password_withUnderscoreOrSpace_isValid() {
        assertThat(isPasswordValid("Pass_word1")).isTrue();
        assertThat(isPasswordValid("pass word 1")).isTrue();
    }

    @Test
    void password_shorterThanEight_isInvalid() {
        assertThat(isPasswordValid("abc1234")).isFalse();
    }

    @Test
    void password_withoutDigit_isInvalid() {
        assertThat(isPasswordValid("abcdefgh")).isFalse();
    }

    @Test
    void password_withoutLetter_isInvalid() {
        assertThat(isPasswordValid("12345678")).isFalse();
    }
}
