import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    template: `
        <div class="modal-header">
            <h4 class="modal-title">{{ title | artemisTranslate }}</h4>
            <button type="button" class="close" aria-label="Close button" aria-describedby="modal-title" (click)="modal.dismiss('Cross click')">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <p *ngIf="translateText === true" style="white-space: pre-line">{{ text | artemisTranslate }}</p>
            <p *ngIf="translateText !== true" style="white-space: pre-line">{{ text }}</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" (click)="modal.dismiss('cancel click')" jhiTranslate="global.form.cancel">Cancel</button>
            <button type="button" ngbAutofocus class="btn btn-danger" (click)="modal.close('Ok click')" jhiTranslate="global.form.confirm">Confirm</button>
        </div>
    `,
})
export class ConfirmAutofocusModalComponent {
    title: string;
    text: string;
    translateText: boolean;

    constructor(public modal: NgbActiveModal) {}
}

@Component({
    selector: 'jhi-confirm-button',
    template: ` <jhi-button [icon]="icon" [title]="title" [tooltip]="tooltip" [disabled]="disabled" [isLoading]="isLoading" (onClick)="onOpenConfirmationModal()"></jhi-button> `,
})
export class ConfirmAutofocusButtonComponent {
    @Input() icon: IconProp;
    @Input() title: string;
    @Input() tooltip: string;
    @Input() disabled = false;
    @Input() isLoading = false;

    @Input() confirmationTitle: string;
    @Input() confirmationText: string;
    @Input() translateText?: boolean;
    @Output() onConfirm = new EventEmitter<void>();
    @Output() onCancel = new EventEmitter<void>();

    constructor(private modalService: NgbModal) {}

    /**
     * open confirmation modal with text and title
     */
    onOpenConfirmationModal() {
        const modalRef: NgbModalRef = this.modalService.open(ConfirmAutofocusModalComponent as Component, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.text = this.confirmationText;
        modalRef.componentInstance.title = this.confirmationTitle;
        if (this.translateText !== undefined) {
            modalRef.componentInstance.translateText = this.translateText;
        } else {
            modalRef.componentInstance.translateText = false;
        }
        modalRef.result.then(
            () => {
                this.onConfirm.emit();
            },
            () => {
                this.onCancel.emit();
            },
        );
    }
}
