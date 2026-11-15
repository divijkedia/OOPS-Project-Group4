package com.iitsm.service;

import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Role;
import com.iitsm.domain.exception.ResourceAlreadyExistsException;
import com.iitsm.domain.exception.UserNotFoundException;
import com.iitsm.domain.factory.UserFactory;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Technician;
import com.iitsm.domain.model.User;
import com.iitsm.repository.EmployeeRepository;
import com.iitsm.repository.TechnicianRepository;
import com.iitsm.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Service managing user lifecycle, authentication records, and polymorphic user hierarchies.
 */
@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final TechnicianRepository technicianRepository;
    private final UserFactory userFactory;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       EmployeeRepository employeeRepository,
                       TechnicianRepository technicianRepository,
                       UserFactory userFactory,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.technicianRepository = technicianRepository;
        this.userFactory = userFactory;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public Technician getTechnicianById(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Transactional
    public User registerUser(Role role, String username, String email, String rawPassword,
                             String fullName, String department, String phone,
                             ExperienceLevel experienceLevel, Integer maxWorkload, Set<String> skills) {
        if (userRepository.existsByUsername(username)) {
            throw new ResourceAlreadyExistsException(String.format("Username '%s' is already registered", username));
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResourceAlreadyExistsException(String.format("Email '%s' is already registered", email));
        }

        String passwordHash = passwordEncoder.encode(rawPassword);
        User user = userFactory.createUser(role, username, email, passwordHash, fullName,
                department, phone, experienceLevel, maxWorkload, skills);

        return userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = getUserById(id);
        user.setActive(false);
        userRepository.save(user);
    }
}
