import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GradingSystemComponent } from 'app/grading-system/grading-system.component';
import { GradingSystemService } from 'app/grading-system/grading-system.service';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { ArtemisTestModule } from '../../test.module';
import { GradeType, GradingScale } from 'app/entities/grading-scale.model';
import { AlertComponent } from 'app/shared/alert/alert.component';
import { MockComponent, MockDirective, MockPipe } from 'ng-mocks';
import { DeleteButtonDirective } from 'app/shared/delete-dialog/delete-button.directive';
import { TranslateTestingModule } from '../../helpers/mocks/service/mock-translate.service';
import { ArtemisTranslatePipe } from 'app/shared/pipes/artemis-translate.pipe';
import { AlertErrorComponent } from 'app/shared/alert/alert-error.component';
import { GradingSystemInfoModalComponent } from 'app/grading-system/grading-system-info-modal/grading-system-info-modal.component';
import { FormsModule } from '@angular/forms';
import { GradeStep } from 'app/entities/grade-step.model';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

chai.use(sinonChai);
const expect = chai.expect;

describe('Grading System Component', () => {
    let comp: GradingSystemComponent;
    let fixture: ComponentFixture<GradingSystemComponent>;
    let gradingSystemService: GradingSystemService;

    const gradeStep1: GradeStep = {
        gradeName: 'Fail',
        lowerBoundPercentage: 0,
        upperBoundPercentage: 40,
        lowerBoundInclusive: true,
        upperBoundInclusive: false,
        isPassingGrade: false,
    };
    const gradeStep2: GradeStep = {
        gradeName: 'Pass',
        lowerBoundPercentage: 40,
        upperBoundPercentage: 80,
        lowerBoundInclusive: true,
        upperBoundInclusive: false,
        isPassingGrade: true,
    };
    const gradeStep3: GradeStep = {
        gradeName: 'Excellent',
        lowerBoundPercentage: 80,
        upperBoundPercentage: 100,
        lowerBoundInclusive: true,
        upperBoundInclusive: true,
        isPassingGrade: true,
    };
    const gradeSteps = [gradeStep1, gradeStep2, gradeStep3];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ArtemisTestModule, TranslateTestingModule, FormsModule],
            declarations: [
                GradingSystemComponent,
                MockComponent(AlertComponent),
                MockComponent(AlertErrorComponent),
                MockComponent(GradingSystemInfoModalComponent),
                MockDirective(DeleteButtonDirective),
                MockPipe(ArtemisTranslatePipe),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GradingSystemComponent);
        comp = fixture.componentInstance;

        gradingSystemService = TestBed.inject(GradingSystemService);
    });

    beforeEach(() => {
        comp.gradingScale = new GradingScale();
        comp.gradingScale.gradeSteps = cloneDeep(gradeSteps);
        comp.courseId = 123;
        comp.examId = 456;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should generate default grading scale', () => {
        comp.generateDefaultGradingScale();

        expect(comp.gradingScale.gradeType).to.equal(GradeType.GRADE);
        expect(comp.firstPassingGrade).to.equal('4.0');
        expect(comp.lowerBoundInclusivity).true;
        expect(comp.gradingScale.gradeSteps.length).is.equal(13);
        comp.gradingScale.gradeSteps.forEach((gradeStep) => {
            expect(gradeStep.id).undefined;
            expect(gradeStep.gradeName).to.be.ok;
            expect(gradeStep.lowerBoundInclusive).true;
            expect(gradeStep.lowerBoundPercentage).to.be.within(0, 100);
            expect(gradeStep.upperBoundPercentage).to.be.within(0, 100);
            expect(gradeStep.lowerBoundPercentage).to.be.lessThanOrEqual(gradeStep.upperBoundPercentage);
            if (gradeStep.upperBoundPercentage === 100) {
                expect(gradeStep.upperBoundInclusive).true;
            } else {
                expect(gradeStep.upperBoundInclusive).false;
            }
            if (gradeStep.lowerBoundPercentage >= 50) {
                expect(gradeStep.isPassingGrade).true;
            }
        });
    });

    it('should delete grade step', () => {
        comp.deleteGradeStep(1);

        expect(comp.gradingScale.gradeSteps.length).to.be.equal(2);
        expect(comp.gradingScale.gradeSteps).to.not.contain(gradeStep2);
    });

    it('should create grade step', () => {
        comp.lowerBoundInclusivity = true;

        comp.createGradeStep();

        expect(comp.gradingScale.gradeSteps.length).to.be.equal(4);
        expect(comp.gradingScale.gradeSteps[3].id).to.be.undefined;
        expect(comp.gradingScale.gradeSteps[3].gradeName).to.be.equal('');
        expect(comp.gradingScale.gradeSteps[3].lowerBoundPercentage).to.be.equal(100);
        expect(comp.gradingScale.gradeSteps[3].upperBoundPercentage).to.be.equal(100);
        expect(comp.gradingScale.gradeSteps[3].isPassingGrade).to.be.equal(true);
        expect(comp.gradingScale.gradeSteps[3].lowerBoundInclusive).to.be.equal(true);
        expect(comp.gradingScale.gradeSteps[3].upperBoundInclusive).to.be.equal(true);
    });

    it('should check grade type correctly', () => {
        comp.gradingScale.gradeType = GradeType.GRADE;

        expect(comp.isGradeType()).to.be.equal(true);

        comp.gradingScale.gradeType = GradeType.BONUS;

        expect(comp.isGradeType()).to.be.equal(false);
    });

    it('should delete grade names correctly', () => {
        comp.deleteGradeNames();

        comp.gradingScale.gradeSteps.forEach((gradeStep) => {
            expect(gradeStep.gradeName).is.equal('');
        });
    });

    it('should filter grade steps with empty names correctly', () => {
        comp.gradingScale.gradeSteps[0].gradeName = '';
        comp.gradingScale.gradeSteps[2].gradeName = '';

        const filteredGradeSteps = comp.gradeStepsWithNonemptyNames();

        expect(filteredGradeSteps.length).to.equal(1);
        expect(filteredGradeSteps[0]).to.deep.equal(gradeStep2);
    });

    it('should set passing Grades correctly', () => {
        comp.firstPassingGrade = 'Fail';

        comp.setPassingGrades(comp.gradingScale.gradeSteps);

        comp.gradingScale.gradeSteps.forEach((gradeStep) => {
            expect(gradeStep.isPassingGrade).to.be.equal(true);
        });

        comp.firstPassingGrade = '';

        comp.setPassingGrades(comp.gradingScale.gradeSteps);

        comp.gradingScale.gradeSteps.forEach((gradeStep) => {
            expect(gradeStep.isPassingGrade).to.be.equal(false);
        });
    });

    it('should determine first passing grade correctly', () => {
        comp.determineFirstPassingGrade();

        expect(comp.firstPassingGrade).to.be.equal('Pass');
    });

    it('should set inclusivity correctly', () => {
        comp.lowerBoundInclusivity = false;

        comp.setInclusivity(comp.gradingScale.gradeSteps);

        comp.gradingScale.gradeSteps.forEach((gradeStep) => {
            expect(gradeStep.upperBoundInclusive).to.be.equal(true);
            if (gradeStep.lowerBoundPercentage === 0) {
                expect(gradeStep.lowerBoundInclusive).to.be.equal(true);
            } else {
                expect(gradeStep.lowerBoundInclusive).to.be.equal(false);
            }
        });
    });

    it('should determine lower bound inclusivity correctly', () => {
        comp.setBoundInclusivity();

        expect(comp.lowerBoundInclusivity).to.be.equal(true);
    });

    it('should sort correctly', () => {
        comp.sortGradeSteps(comp.gradingScale.gradeSteps);

        expect(comp.gradingScale.gradeSteps[0]).to.deep.equal(gradeStep1);
        expect(comp.gradingScale.gradeSteps[1]).to.deep.equal(gradeStep2);
        expect(comp.gradingScale.gradeSteps[2]).to.deep.equal(gradeStep3);
    });

    it('should delete grading scale for course', () => {
        comp.existingGradingScale = true;
        comp.isExam = false;
        comp.courseId = 123;
        const gradingSystemDeleteForCourseStub = sinon.stub(gradingSystemService, 'deleteGradingScaleForCourse').returns(of(new HttpResponse<{}>({ body: [] })));

        comp.delete();

        expect(gradingSystemDeleteForCourseStub).to.have.been.calledOnceWith(comp.courseId);
        expect(comp.existingGradingScale).to.equal(false);
    });

    it('should delete grading scale for exam', () => {
        comp.existingGradingScale = true;
        comp.isExam = true;
        const gradingSystemDeleteForExamStub = sinon.stub(gradingSystemService, 'deleteGradingScaleForExam').returns(of(new HttpResponse<{}>({ body: [] })));

        comp.delete();

        expect(gradingSystemDeleteForExamStub).to.have.been.calledOnceWith(comp.courseId, comp.examId);
        expect(comp.existingGradingScale).to.equal(false);
    });

    it('should create grading scale correctly for course', () => {
        comp.existingGradingScale = false;
        const createdGradingScaleForCourse = comp.gradingScale;
        createdGradingScaleForCourse.gradeType = GradeType.BONUS;
        const gradingSystemCreateForCourseStub = sinon
            .stub(gradingSystemService, 'createGradingScaleForCourse')
            .returns(of(new HttpResponse<GradingScale>({ body: createdGradingScaleForCourse })));

        comp.save();

        expect(gradingSystemCreateForCourseStub).to.have.been.calledOnceWith(comp.courseId);
        expect(comp.existingGradingScale).to.equal(true);
        expect(comp.gradingScale).to.equal(createdGradingScaleForCourse);
    });

    it('should create grading scale correctly for exam', () => {
        comp.existingGradingScale = false;
        comp.isExam = true;
        const createdGradingScaleForExam = comp.gradingScale;
        createdGradingScaleForExam.gradeType = GradeType.BONUS;
        const gradingSystemCreateForExamStub = sinon
            .stub(gradingSystemService, 'createGradingScaleForExam')
            .returns(of(new HttpResponse<GradingScale>({ body: createdGradingScaleForExam })));

        comp.save();

        expect(gradingSystemCreateForExamStub).to.have.been.calledOnceWith(comp.courseId, comp.examId);
        expect(comp.existingGradingScale).to.equal(true);
        expect(comp.gradingScale).to.deep.equal(createdGradingScaleForExam);
    });

    it('should update grading scale correctly for course', () => {
        comp.existingGradingScale = true;
        const updateGradingScaleFoCourse = comp.gradingScale;
        updateGradingScaleFoCourse.gradeType = GradeType.BONUS;
        const gradingSystemUpdateForCourseStub = sinon
            .stub(gradingSystemService, 'updateGradingScaleForCourse')
            .returns(of(new HttpResponse<GradingScale>({ body: updateGradingScaleFoCourse })));

        comp.save();

        expect(gradingSystemUpdateForCourseStub).to.have.been.calledOnceWith(comp.courseId);
        expect(comp.existingGradingScale).to.equal(true);
        expect(comp.gradingScale).to.deep.equal(updateGradingScaleFoCourse);
    });

    it('should update grading scale correctly for exam', () => {
        comp.existingGradingScale = true;
        comp.isExam = true;
        const updatedGradingScaleForExam = comp.gradingScale;
        updatedGradingScaleForExam.gradeType = GradeType.BONUS;
        const gradingSystemUpdateForExamStub = sinon
            .stub(gradingSystemService, 'updateGradingScaleForExam')
            .returns(of(new HttpResponse<GradingScale>({ body: updatedGradingScaleForExam })));

        comp.save();

        expect(gradingSystemUpdateForExamStub).to.have.been.calledOnceWith(comp.courseId);
        expect(comp.existingGradingScale).to.equal(true);
        expect(comp.gradingScale).to.deep.equal(updatedGradingScaleForExam);
    });

    it('should handle find response correctly', () => {
        comp.handleFindResponse(comp.gradingScale);

        expect(comp.firstPassingGrade).to.be.equal('Pass');
        expect(comp.lowerBoundInclusivity).to.be.equal(true);
        expect(comp.existingGradingScale).to.be.equal(true);
    });
});
