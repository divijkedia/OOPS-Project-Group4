package com.iitsm.api.controller;

import com.iitsm.api.dto.request.LoginRequest;
import com.iitsm.api.dto.request.RegisterRequest;
import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.AuthResponse;
import com.iitsm.api.dto.response.UserResponse;
import com.iitsm.api.mapper.UserMapper;
import com.iitsm.domain.exception.InvalidCredentialsException;
import com.iitsm.domain.model.User;
import com.iitsm.security.JwtTokenProvider;
import com.iitsm.security.SecurityUser;
import com.iitsm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing authentication and user registration endpoints.
 */
@Tag(name = "Authentication", description = "User registration, login, and token issuance")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final UserMapper userMapper;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider tokenProvider,
                          UserService userService,
                          UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @Operation(summary = "Authenticate user and issue JWT bearer token")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
            String token = tokenProvider.generateToken(authentication);

            User user = userService.getUserById(securityUser.getId());
            AuthResponse authResponse = new AuthResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getFullName(),
                    user.getRole()
            );

            return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful"));
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }

    @Operation(summary = "Register a new user (Employee, Technician, or Admin)")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        User registered = userService.registerUser(
                request.role(),
                request.username(),
                request.email(),
                request.password(),
                request.fullName(),
                request.department(),
                request.phone(),
                request.experienceLevel(),
                request.maxWorkload(),
                request.skills()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userMapper.toResponse(registered), "User registered successfully"));
    }

    @Operation(summary = "Get currently authenticated user details")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal SecurityUser currentUser) {
        if (currentUser == null) {
            throw new InvalidCredentialsException("Authentication required");
        }
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(user)));
    }
}
