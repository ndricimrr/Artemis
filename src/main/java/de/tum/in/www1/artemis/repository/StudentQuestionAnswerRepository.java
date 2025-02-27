package de.tum.in.www1.artemis.repository;

import javax.validation.constraints.NotNull;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.tum.in.www1.artemis.domain.StudentQuestionAnswer;
import de.tum.in.www1.artemis.web.rest.errors.EntityNotFoundException;

/**
 * Spring Data repository for the StudentQuestionAnswer entity.
 */
@SuppressWarnings("unused")
@Repository
public interface StudentQuestionAnswerRepository extends JpaRepository<StudentQuestionAnswer, Long> {

    @NotNull
    default StudentQuestionAnswer findByIdElseThrow(long answerId) {
        return findById(answerId).orElseThrow(() -> new EntityNotFoundException("Student Question Answer", answerId));
    }

}
