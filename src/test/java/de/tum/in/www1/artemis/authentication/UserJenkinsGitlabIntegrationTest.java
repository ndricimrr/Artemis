package de.tum.in.www1.artemis.authentication;

import java.io.IOException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.util.ReflectionTestUtils;

import de.tum.in.www1.artemis.AbstractSpringIntegrationJenkinsGitlabTest;
import de.tum.in.www1.artemis.service.connectors.gitlab.GitLabUserManagementService;
import de.tum.in.www1.artemis.service.connectors.jenkins.JenkinsUserManagementService;
import de.tum.in.www1.artemis.util.UserTestService;
import de.tum.in.www1.artemis.web.rest.vm.ManagedUserVM;

public class UserJenkinsGitlabIntegrationTest extends AbstractSpringIntegrationJenkinsGitlabTest {

    @Value("${artemis.continuous-integration.user}")
    private String jenkinsAdminUsername;

    @Value("${jenkins.use-pseudonyms:#{false}}")
    private boolean usePseudonymsJenkins;

    @Value("${gitlab.use-pseudonyms:#{false}}")
    private boolean usePseudonymsGitlab;

    @Autowired
    private UserTestService userTestService;

    @Autowired
    private JenkinsUserManagementService jenkinsUserManagementService;

    @Autowired
    private GitLabUserManagementService gitLabUserManagementService;

    @BeforeEach
    public void setUp() throws Exception {
        userTestService.setup(this);
        gitlabRequestMockProvider.enableMockingOfRequests();
        jenkinsRequestMockProvider.enableMockingOfRequests(jenkinsServer);
    }

    @AfterEach
    public void teardown() throws IOException {
        userTestService.tearDown();
    }

    @Test
    @WithMockUser(value = "admin", roles = "ADMIN")
    public void updateUser_asAdmin_isSuccessful() throws Exception {
        userTestService.updateUser_asAdmin_isSuccessful();
    }

    @Test
    @WithMockUser(value = "admin", roles = "ADMIN")
    public void updateUserInvalidId() throws Exception {
        userTestService.updateUserInvalidId();
    }

    @Test
    @WithMockUser(value = "admin", roles = "ADMIN")
    public void updateUserExistingEmail() throws Exception {
        userTestService.updateUserExistingEmail();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void updateUser_withNullPassword_oldPasswordNotChanged() throws Exception {
        userTestService.updateUser_withNullPassword_oldPasswordNotChanged();
    }

    @Test
    @WithMockUser(value = "instructor1", roles = "INSTRUCTOR")
    public void updateUser_asInstructor_forbidden() throws Exception {
        request.put("/api/users", new ManagedUserVM(userTestService.getStudent()), HttpStatus.FORBIDDEN);
    }

    @Test
    @WithMockUser(value = "tutor1", roles = "TA")
    public void updateUser_asTutor_forbidden() throws Exception {
        request.put("/api/users", new ManagedUserVM(userTestService.getStudent()), HttpStatus.FORBIDDEN);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUserWithPseudonymsIsSuccessful() throws Exception {
        ReflectionTestUtils.setField(jenkinsUserManagementService, "usePseudonyms", true);
        ReflectionTestUtils.setField(gitLabUserManagementService, "usePseudonyms", true);
        userTestService.createUser_asAdmin_isSuccessful();
        ReflectionTestUtils.setField(jenkinsUserManagementService, "usePseudonyms", usePseudonymsJenkins);
        ReflectionTestUtils.setField(gitLabUserManagementService, "usePseudonyms", usePseudonymsGitlab);

    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createAdminUserSkippedInJenkins() throws Exception {
        ReflectionTestUtils.setField(jenkinsUserManagementService, "jenkinsAdminUsername", "batman");
        userTestService.createUser_asAdmin_isSuccessful();
        ReflectionTestUtils.setField(jenkinsUserManagementService, "jenkinsAdminUsername", jenkinsAdminUsername);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void deleteAdminUserSkippedInJenkins() throws Exception {
        ReflectionTestUtils.setField(jenkinsUserManagementService, "jenkinsAdminUsername", "student1");
        userTestService.deleteUser_isSuccessful();
        ReflectionTestUtils.setField(jenkinsUserManagementService, "jenkinsAdminUsername", jenkinsAdminUsername);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void updateAdminUserSkippedInJenkins() throws Exception {
        ReflectionTestUtils.setField(jenkinsUserManagementService, "jenkinsAdminUsername", "student1");
        userTestService.updateUser_asAdmin_isSuccessful();
        ReflectionTestUtils.setField(jenkinsUserManagementService, "jenkinsAdminUsername", jenkinsAdminUsername);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_isSuccessful() throws Exception {
        userTestService.createUser_asAdmin_isSuccessful();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_hasId() throws Exception {
        userTestService.createUser_asAdmin_hasId();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_existingLogin() throws Exception {
        userTestService.createUser_asAdmin_existingLogin();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_existingEmail() throws Exception {
        userTestService.createUser_asAdmin_existingEmail();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_existsInCi_internalError() throws Exception {
        userTestService.createUser_asAdmin_existsInCi_internalError();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_illegalLogin_internalError() throws Exception {
        userTestService.createUser_asAdmin_illegalLogin_internalError();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_failInExternalUserManagement_internalError() throws Exception {
        userTestService.createUser_asAdmin_failInExternalCiUserManagement_internalError();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_failInExternalCiUserManagement_cannotGetCiUser_internalError() throws Exception {
        userTestService.createUser_asAdmin_failInExternalCiUserManagement_cannotGetCiUser_internalError();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_asAdmin_failInExternalVcsUserManagement_internalError() throws Exception {
        userTestService.createUser_asAdmin_failInExternalVcsUserManagement_internalError();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUser_withNullAsPassword_generatesRandomPassword() throws Exception {
        userTestService.createUser_withNullAsPassword_generatesRandomPassword();
    }

    @Test
    @WithMockUser(value = "admin", roles = "ADMIN")
    public void deleteUser_isSuccessful() throws Exception {
        userTestService.deleteUser_isSuccessful();
    }

    @Test
    @WithMockUser(value = "admin", roles = "ADMIN")
    public void deleteUser_doesntExistInUserManagement_isSuccessful() throws Exception {
        userTestService.deleteUser_doesntExistInUserManagement_isSuccessful();
    }

    @Test
    @WithMockUser(value = "admin", roles = "ADMIN")
    public void deleteUser_FailsInExternalCiUserManagement_isNotSuccessful() throws Exception {
        userTestService.deleteUser_FailsInExternalCiUserManagement_isNotSuccessful();
    }

    @Test
    @WithMockUser(value = "admin", roles = "ADMIN")
    public void deleteUser_FailsInExternalVcsUserManagement_isNotSuccessful() throws Exception {
        userTestService.deleteUser_FailsInExternalVcsUserManagement_isNotSuccessful();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void getUsers_asAdmin_isSuccessful() throws Exception {
        userTestService.getUsers_asAdmin_isSuccessful();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void searchUsers_asInstructor_isSuccessful() throws Exception {
        userTestService.searchUsers_asInstructor_isSuccessful();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void searchUsers_asAdmin_badRequest() throws Exception {
        userTestService.searchUsers_asAdmin_badRequest();
    }

    @Test
    @WithMockUser(username = "tutor1", roles = "TA")
    public void searchUsers_asTutor_forbidden() throws Exception {
        userTestService.searchUsers_asTutor_forbidden();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void getUserViaFilter_asAdmin_isSuccessful() throws Exception {
        userTestService.getUserViaFilter_asAdmin_isSuccessful();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void getAuthorities_asAdmin_isSuccessful() throws Exception {
        userTestService.getAuthorities_asAdmin_isSuccessful();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void getUsersOrAuthorities_asInstructor_forbidden() throws Exception {
        userTestService.getUsersOrAuthorities_asInstructor_forbidden();
    }

    @Test
    @WithMockUser(username = "tutor1", roles = "TA")
    public void getUsersOrAuthorities_asTutor_forbidden() throws Exception {
        userTestService.getUsersOrAuthorities_asTutor_forbidden();
    }

    @Test
    @WithMockUser(username = "student1", roles = "USER")
    public void getUsersOrAuthorities_asStudent_forbidden() throws Exception {
        userTestService.getUsersOrAuthorities_asStudent_forbidden();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void getUser_asAdmin_isSuccessful() throws Exception {
        userTestService.getUser_asAdmin_isSuccessful();
    }

    @Test
    @WithMockUser(username = "student1", roles = "USER")
    public void updateUserNotificationDate_asStudent_isSuccessful() throws Exception {
        userTestService.updateUserNotificationDate_asStudent_isSuccessful();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void createUserWithGroups() throws Exception {
        userTestService.createUserWithGroups();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void updateUserGroups() throws Exception {
        userTestService.updateUserGroups();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void updateUserLogin() throws Exception {
        userTestService.updateUserLogin();
    }
}
