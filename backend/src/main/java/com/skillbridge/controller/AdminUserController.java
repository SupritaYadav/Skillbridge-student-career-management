package com.skillbridge.controller;

import com.skillbridge.entity.User;
import com.skillbridge.entity.Student;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final UserRepository users;
    private final StudentRepository students;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository users, StudentRepository students, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.students = students;
        this.passwordEncoder = passwordEncoder;
    }

    private boolean isAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private Map<String, Object> safeUser(User user) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("name", user.getName());
        result.put("email", user.getEmail());
        result.put("role", user.getRole());
        result.put("enabled", user.isEnabled());
        return result;
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required.");
        List<Map<String, Object>> result = users.findAll().stream().map(this::safeUser).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createFaculty(@RequestBody Map<String, String> body, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required.");
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");
        if (name.isBlank() || email.isBlank() || password.length() < 8) {
            return ResponseEntity.badRequest().body("Name, email and a password of at least 8 characters are required.");
        }
        if (users.existsByEmail(email)) return ResponseEntity.badRequest().body("Email is already registered.");
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("FACULTY");
        user.setEnabled(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(safeUser(users.save(user)));
    }

    @PutMapping("/{id}/role")
    @Transactional
    public ResponseEntity<?> setRole(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required.");
        User user = users.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (user.getEmail().equalsIgnoreCase(auth.getName())) return ResponseEntity.badRequest().body("You cannot change your own Admin role.");
        String role = body.getOrDefault("role", "").trim().toUpperCase();
        if (!List.of("STUDENT", "FACULTY").contains(role)) {
            return ResponseEntity.badRequest().body("Only STUDENT and FACULTY roles can be assigned here.");
        }
        user.setRole(role);
        User saved = users.save(user);
        if ("STUDENT".equals(role) && students.findByUser_Id(saved.getId()).isEmpty()) {
            Student profile = new Student();
            profile.setName(saved.getName());
            profile.setEmail(saved.getEmail());
            profile.setUser(saved);
            students.save(profile);
        }
        return ResponseEntity.ok(safeUser(saved));
    }

    @PutMapping("/{id}/enabled")
    public ResponseEntity<?> setEnabled(@PathVariable Long id, @RequestBody Map<String, Boolean> body, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required.");
        User user = users.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (user.getEmail().equalsIgnoreCase(auth.getName())) return ResponseEntity.badRequest().body("You cannot disable your own account.");
        user.setEnabled(Boolean.TRUE.equals(body.get("enabled")));
        return ResponseEntity.ok(safeUser(users.save(user)));
    }


}
