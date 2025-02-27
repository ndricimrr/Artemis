package de.tum.in.www1.artemis;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;

import de.tum.in.www1.artemis.domain.Lecture;
import de.tum.in.www1.artemis.domain.lecture.VideoUnit;
import de.tum.in.www1.artemis.repository.LectureRepository;
import de.tum.in.www1.artemis.repository.UserRepository;
import de.tum.in.www1.artemis.repository.VideoUnitRepository;
import de.tum.in.www1.artemis.util.ModelFactory;

public class VideoUnitIntegrationTest extends AbstractSpringIntegrationBambooBitbucketJiraTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoUnitRepository videoUnitRepository;

    @Autowired
    private LectureRepository lectureRepository;

    private Lecture lecture1;

    private VideoUnit videoUnit;

    @BeforeEach
    public void initTestCase() throws Exception {
        this.database.addUsers(1, 1, 0, 1);
        this.lecture1 = this.database.createCourseWithLecture(true);
        this.videoUnit = new VideoUnit();
        this.videoUnit.setDescription("LoremIpsum");
        this.videoUnit.setName("LoremIpsum");
        this.videoUnit.setSource("oHg5SJYRHA0");

        // Add users that are not in the course
        userRepository.save(ModelFactory.generateActivatedUser("student42"));
        userRepository.save(ModelFactory.generateActivatedUser("tutor42"));
        userRepository.save(ModelFactory.generateActivatedUser("instructor42"));
    }

    private void testAllPreAuthorize() throws Exception {
        request.put("/api/lectures/" + lecture1.getId() + "/video-units", videoUnit, HttpStatus.FORBIDDEN);
        request.post("/api/lectures/" + lecture1.getId() + "/video-units", videoUnit, HttpStatus.FORBIDDEN);
        request.get("/api/lectures/" + lecture1.getId() + "/video-units/0", HttpStatus.FORBIDDEN, VideoUnit.class);
    }

    @AfterEach
    public void resetDatabase() {
        database.resetDatabase();
    }

    @Test
    @WithMockUser(username = "tutor1", roles = "TA")
    public void testAll_asTutor() throws Exception {
        this.testAllPreAuthorize();
    }

    @Test
    @WithMockUser(username = "student1", roles = "USER")
    public void testAll_asStudent() throws Exception {
        this.testAllPreAuthorize();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void createVideoUnit_asInstructor_shouldCreateVideoUnit() throws Exception {
        var persistedVideoUnit = request.postWithResponseBody("/api/lectures/" + this.lecture1.getId() + "/video-units", videoUnit, VideoUnit.class, HttpStatus.CREATED);
        assertThat(persistedVideoUnit.getId()).isNotNull();
    }

    @Test
    @WithMockUser(username = "instructor42", roles = "INSTRUCTOR")
    public void createVideoUnit_InstructorNotInCourse_shouldReturnForbidden() throws Exception {
        request.postWithResponseBody("/api/lectures/" + this.lecture1.getId() + "/video-units", videoUnit, VideoUnit.class, HttpStatus.FORBIDDEN);
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void updateVideoUnit_asInstructor_shouldUpdateVideoUnit() throws Exception {
        this.videoUnit = videoUnitRepository.save(this.videoUnit);
        lecture1 = lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get();
        lecture1.addLectureUnit(this.videoUnit);
        lecture1 = lectureRepository.save(lecture1);

        this.videoUnit = (VideoUnit) lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get().getLectureUnits().stream().findFirst()
                .get();
        this.videoUnit.setDescription("Changed");
        this.videoUnit = request.putWithResponseBody("/api/lectures/" + lecture1.getId() + "/video-units", this.videoUnit, VideoUnit.class, HttpStatus.OK);
        assertThat(this.videoUnit.getDescription()).isEqualTo("Changed");
    }

    @Test
    @WithMockUser(username = "instructor42", roles = "INSTRUCTOR")
    public void updateVideoUnit_InstructorNotInCourse_shouldReturnForbidden() throws Exception {
        this.videoUnit = videoUnitRepository.save(this.videoUnit);
        lecture1 = lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get();
        lecture1.addLectureUnit(this.videoUnit);
        lecture1 = lectureRepository.save(lecture1);

        this.videoUnit = (VideoUnit) lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get().getLectureUnits().stream().findFirst()
                .get();
        this.videoUnit.setDescription("Changed");
        this.videoUnit = request.putWithResponseBody("/api/lectures/" + lecture1.getId() + "/video-units", this.videoUnit, VideoUnit.class, HttpStatus.FORBIDDEN);
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void updateVideoUnit_noId_shouldReturnBadRequest() throws Exception {
        this.videoUnit = videoUnitRepository.save(this.videoUnit);
        lecture1 = lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get();
        lecture1.addLectureUnit(this.videoUnit);
        lecture1 = lectureRepository.save(lecture1);
        this.videoUnit = (VideoUnit) lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get().getLectureUnits().stream().findFirst()
                .get();
        this.videoUnit.setId(null);
        this.videoUnit = request.putWithResponseBody("/api/lectures/" + lecture1.getId() + "/video-units", this.videoUnit, VideoUnit.class, HttpStatus.BAD_REQUEST);
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void getVideoUnit_correctId_shouldReturnVideoUnit() throws Exception {
        this.videoUnit = videoUnitRepository.save(this.videoUnit);
        lecture1 = lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get();
        lecture1.addLectureUnit(this.videoUnit);
        lecture1 = lectureRepository.save(lecture1);
        this.videoUnit = (VideoUnit) lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get().getLectureUnits().stream().findFirst()
                .get();
        VideoUnit videoUnitFromRequest = request.get("/api/lectures/" + lecture1.getId() + "/video-units/" + this.videoUnit.getId(), HttpStatus.OK, VideoUnit.class);
        assertThat(this.videoUnit.getId()).isEqualTo(videoUnitFromRequest.getId());
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void deleteVideoUnit_correctId_shouldDeleteVideoUnit() throws Exception {
        this.videoUnit = videoUnitRepository.save(this.videoUnit);
        lecture1 = lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get();
        lecture1.addLectureUnit(this.videoUnit);
        lecture1 = lectureRepository.save(lecture1);
        this.videoUnit = (VideoUnit) lectureRepository.findByIdWithStudentQuestionsAndLectureUnitsAndLearningGoals(lecture1.getId()).get().getLectureUnits().stream().findFirst()
                .get();
        assertThat(this.videoUnit.getId()).isNotNull();
        request.delete("/api/lectures/" + lecture1.getId() + "/lecture-units/" + this.videoUnit.getId(), HttpStatus.OK);
        request.get("/api/lectures/" + lecture1.getId() + "/video-units/" + this.videoUnit.getId(), HttpStatus.NOT_FOUND, VideoUnit.class);
    }

}
