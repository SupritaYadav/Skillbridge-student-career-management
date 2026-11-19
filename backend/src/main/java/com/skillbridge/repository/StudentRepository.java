
package com.skillbridge.repository;

import com.skillbridge.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUser_Id(Long userId);
    Optional<Student> findByUser_Email(String email);

}
