package com.duy.japankanji.service;

import com.duy.japankanji.dto.AuthResponse;
import com.duy.japankanji.dto.LoginRequest;
import com.duy.japankanji.dto.RegisterRequest;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password())); // hash mật khẩu, KHÔNG lưu plain text
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getUsername());
        return new AuthResponse(token, saved.getUsername(), saved.getId());
    }

    public AuthResponse login(LoginRequest request) {
        // Nhờ Spring Security tự kiểm tra username/password có khớp không
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("Sai username hoặc password"));

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getId());
    }
}