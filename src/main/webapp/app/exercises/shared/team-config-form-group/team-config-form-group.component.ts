import { Component, Input, OnInit } from '@angular/core';
import { TeamAssignmentConfig } from 'app/entities/team-assignment-config.model';
import { cloneDeep } from 'lodash';
import { Exercise, ExerciseMode } from 'app/entities/exercise.model';

@Component({
    selector: 'jhi-team-config-form-group',
    templateUrl: './team-config-form-group.component.html',
    styleUrls: ['./team-config-form-group.component.scss'],
})
export class TeamConfigFormGroupComponent implements OnInit {
    readonly INDIVIDUAL = ExerciseMode.INDIVIDUAL;
    readonly TEAM = ExerciseMode.TEAM;

    @Input() exercise: Exercise;

    config: TeamAssignmentConfig;

    /**
     * Life cycle hook to indicate component creation is done
     */
    ngOnInit() {
        this.config = this.exercise.teamAssignmentConfig || new TeamAssignmentConfig();
    }

    get changeExerciseModeDisabled(): boolean {
        return Boolean(this.exercise.id) || !!this.exercise.exerciseGroup;
    }

    /**
     * Hook to indicate that exercise mode changed
     * @param {ExerciseMode} mode - Exercise mode
     */
    onExerciseModeChange(mode: ExerciseMode) {
        if (mode === ExerciseMode.TEAM) {
            this.applyCurrentConfig();
        } else {
            this.exercise.teamAssignmentConfig = null;
        }
    }

    /**
     * Update minimum number of team members
     * @param {number} minTeamSize - minimum number of team members
     */
    updateMinTeamSize(minTeamSize: number) {
        this.config.maxTeamSize = Math.max(this.config.maxTeamSize, minTeamSize);
        this.applyCurrentConfig();
    }

    /**
     * Update maximum number of team members
     * @param {number} maxTeamSize - maximum number of team members
     */
    updateMaxTeamSize(maxTeamSize: number) {
        this.config.minTeamSize = Math.min(this.config.minTeamSize, maxTeamSize);
        this.applyCurrentConfig();
    }

    private applyCurrentConfig() {
        this.exercise.teamAssignmentConfig = cloneDeep(this.config);
    }
}
