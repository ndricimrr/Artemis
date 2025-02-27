import { IProgrammingSubmissionService, ProgrammingSubmissionState, ProgrammingSubmissionStateObj } from 'app/exercises/programming/participate/programming-submission.service';
import { of, Observable, empty } from 'rxjs';
import { Exercise } from 'app/entities/exercise.model';

export class MockProgrammingSubmissionService implements IProgrammingSubmissionService {
    getLatestPendingSubmissionByParticipationId = (participationId: number) =>
        of([1, ProgrammingSubmissionState.HAS_NO_PENDING_SUBMISSION, null] as unknown as ProgrammingSubmissionStateObj);
    getSubmissionStateOfExercise = (exerciseId: number) => empty();
    triggerBuild = (participationId: number) => of({});
    triggerInstructorBuild = (participationId: number) => of({});
    unsubscribeAllWebsocketTopics = (exercise: Exercise) => of(null);
    unsubscribeForLatestSubmissionOfParticipation = (participationId: number) => of(null);
    getResultEtaInMs: () => Observable<number>;
    triggerInstructorBuildForAllParticipationsOfExercise: (exerciseId: number) => Observable<void>;
    triggerInstructorBuildForParticipationsOfExercise: (exerciseId: number, participationIds: number[]) => Observable<void>;
}
