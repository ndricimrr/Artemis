import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';
import { ProgrammingExercise } from 'app/entities/programming-exercise.model';
import { ProgrammingExerciseService } from './services/programming-exercise.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseComponent } from 'app/exercises/shared/exercise/exercise.component';
import { TranslateService } from '@ngx-translate/core';
import { ActionType } from 'app/shared/delete-dialog/delete-dialog.model';
import { onError } from 'app/shared/util/global.utils';
import { AccountService } from 'app/core/auth/account.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgrammingExerciseImportComponent } from 'app/exercises/programming/manage/programming-exercise-import.component';
import { isOrion, OrionState } from 'app/shared/orion/orion';
import { OrionConnectorService } from 'app/shared/orion/orion-connector.service';
import { FeatureToggle } from 'app/shared/feature-toggle/feature-toggle.service';
import { ExerciseService } from 'app/exercises/shared/exercise/exercise.service';
import { CourseExerciseService, CourseManagementService } from 'app/course/manage/course-management.service';
import { ProgrammingExerciseSimulationUtils } from 'app/exercises/programming/shared/utils/programming-exercise-simulation-utils';
import { SortService } from 'app/shared/service/sort.service';
import { getCourseFromExercise } from 'app/entities/exercise.model';
import { ProgrammingExerciseEditSelectedComponent } from 'app/exercises/programming/manage/programming-exercise-edit-selected.component';
import { ProgrammingAssessmentRepoExportDialogComponent } from 'app/exercises/programming/assess/repo-export/programming-assessment-repo-export-dialog.component';
import { ProgrammingExerciseParticipationType } from 'app/entities/programming-exercise-participation.model';

@Component({
    selector: 'jhi-programming-exercise',
    templateUrl: './programming-exercise.component.html',
})
export class ProgrammingExerciseComponent extends ExerciseComponent implements OnInit, OnDestroy {
    @Input() programmingExercises: ProgrammingExercise[];
    readonly ActionType = ActionType;
    readonly isOrion = isOrion;
    FeatureToggle = FeatureToggle;
    orionState: OrionState;
    selectedProgrammingExercises: ProgrammingExercise[];
    solutionParticipationType = ProgrammingExerciseParticipationType.SOLUTION;
    templateParticipationType = ProgrammingExerciseParticipationType.TEMPLATE;
    allChecked = false;

    constructor(
        private programmingExerciseService: ProgrammingExerciseService,
        private courseExerciseService: CourseExerciseService,
        public exerciseService: ExerciseService,
        private accountService: AccountService,
        private jhiAlertService: JhiAlertService,
        private modalService: NgbModal,
        private router: Router,
        private javaBridge: OrionConnectorService,
        private programmingExerciseSimulationUtils: ProgrammingExerciseSimulationUtils,
        private sortService: SortService,
        courseService: CourseManagementService,
        translateService: TranslateService,
        eventManager: JhiEventManager,
        route: ActivatedRoute,
    ) {
        super(courseService, translateService, route, eventManager);
        this.programmingExercises = [];
        this.selectedProgrammingExercises = [];
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.javaBridge.state().subscribe((state) => (this.orionState = state));
    }

    protected loadExercises(): void {
        this.courseExerciseService.findAllProgrammingExercisesForCourse(this.courseId).subscribe(
            (res: HttpResponse<ProgrammingExercise[]>) => {
                this.programmingExercises = res.body!;
                // reconnect exercise with course
                this.programmingExercises.forEach((exercise) => {
                    exercise.course = this.course;
                    exercise.isAtLeastTutor = this.accountService.isAtLeastTutorInCourse(getCourseFromExercise(exercise));
                    exercise.isAtLeastEditor = this.accountService.isAtLeastEditorInCourse(getCourseFromExercise(exercise));
                    exercise.isAtLeastInstructor = this.accountService.isAtLeastInstructorInCourse(getCourseFromExercise(exercise));
                });
                this.emitExerciseCount(this.programmingExercises.length);
            },
            (res: HttpErrorResponse) => onError(this.jhiAlertService, res),
        );
    }

    trackId(index: number, item: ProgrammingExercise) {
        return item.id;
    }

    /**
     * Deletes programming exercise
     * @param programmingExerciseId the id of the programming exercise that we want to delete
     * @param $event contains additional checks for deleting exercise
     */
    deleteProgrammingExercise(programmingExerciseId: number, $event: { [key: string]: boolean }) {
        return this.programmingExerciseService.delete(programmingExerciseId, $event.deleteStudentReposBuildPlans, $event.deleteBaseReposBuildPlans).subscribe(
            () => {
                this.eventManager.broadcast({
                    name: 'programmingExerciseListModification',
                    content: 'Deleted an programmingExercise',
                });
                this.dialogErrorSource.next('');
            },
            (error: HttpErrorResponse) => this.dialogErrorSource.next(error.message),
        );
    }

    /**
     * Resets programming exercise
     * @param programmingExerciseId the id of the programming exercise that we want to delete
     */
    resetProgrammingExercise(programmingExerciseId: number) {
        this.exerciseService.reset(programmingExerciseId).subscribe(
            () => this.dialogErrorSource.next(''),
            (error: HttpErrorResponse) => this.dialogErrorSource.next(error.message),
        );
    }

    protected getChangeEventName(): string {
        return 'programmingExerciseListModification';
    }

    sortRows() {
        this.sortService.sortByProperty(this.programmingExercises, this.predicate, this.reverse);
    }

    openImportModal() {
        const modalRef = this.modalService.open(ProgrammingExerciseImportComponent, { size: 'lg', backdrop: 'static' });
        modalRef.result.then(
            (result: ProgrammingExercise) => {
                this.router.navigate(['course-management', this.courseId, 'programming-exercises', 'import', result.id]);
            },
            () => {},
        );
    }

    editInIDE(programmingExercise: ProgrammingExercise) {
        this.javaBridge.editExercise(programmingExercise);
    }

    openOrionEditor(exercise: ProgrammingExercise) {
        try {
            this.router.navigate(['code-editor', 'ide', exercise.id, 'admin', exercise.templateParticipation?.id]);
        } catch (e) {
            this.javaBridge.log(e);
        }
    }

    toggleProgrammingExercise(programmingExercise: ProgrammingExercise) {
        const programmingExerciseIndex = this.selectedProgrammingExercises.indexOf(programmingExercise);
        if (programmingExerciseIndex !== -1) {
            this.selectedProgrammingExercises.splice(programmingExerciseIndex, 1);
        } else {
            this.selectedProgrammingExercises.push(programmingExercise);
        }
    }

    toggleAllProgrammingExercises() {
        if (this.allChecked) {
            this.selectedProgrammingExercises = [];
        } else {
            this.selectedProgrammingExercises = this.selectedProgrammingExercises.concat(this.programmingExercises);
        }
        this.allChecked = !this.allChecked;
    }

    isExerciseSelected(programmingExercise: ProgrammingExercise) {
        return this.selectedProgrammingExercises.includes(programmingExercise);
    }

    openEditSelectedModal() {
        const modalRef = this.modalService.open(ProgrammingExerciseEditSelectedComponent, { size: 'xl', backdrop: 'static' });
        modalRef.componentInstance.selectedProgrammingExercises = this.selectedProgrammingExercises;
        modalRef.closed.subscribe(() => {
            location.reload();
        });
    }

    openRepoExportModal() {
        const modalRef = this.modalService.open(ProgrammingAssessmentRepoExportDialogComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.selectedProgrammingExercises = this.selectedProgrammingExercises;
    }

    // ################## ONLY FOR LOCAL TESTING PURPOSE -- START ##################

    /**
     * Checks if the url includes the string "nolocalsetup', which is an indication
     * that the particular programming exercise has no local setup
     * This functionality is only for testing purposes (noVersionControlAndContinuousIntegrationAvailable)
     * @param urlToCheck the url which will be check if it contains the substring
     */
    noVersionControlAndContinuousIntegrationAvailableCheck(urlToCheck: string): boolean {
        return this.programmingExerciseSimulationUtils.noVersionControlAndContinuousIntegrationAvailableCheck(urlToCheck);
    }

    // ################## ONLY FOR LOCAL TESTING PURPOSE -- END ##################
}
