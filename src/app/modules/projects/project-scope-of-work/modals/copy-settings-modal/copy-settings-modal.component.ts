import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Project } from '@app/models';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalService } from '@app/services';
import { ActiveProjectSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/active-project-selection-modal.component';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { scopeOfWorkSelectors } from '../../state';
import * as scopeOfWorkActions from '../../state/actions';

@Component({
  selector: 'copy-settings-modal',
  templateUrl: 'copy-settings-modal.component.html',
})
export class CopySettingsModalComponent {
  public projectId: string;

  copyForm = this.fb.group({
    case: this.fb.group({
      id: [null, Validators.required],
      name: [null, Validators.required],
    }),
    caseIdFrom: [null, Validators.required],
    copyChartOfAccount: false,
    copyLedgerSettings: false,
    copyFirmPmtInstructions: false,
    copyMessages: false,
  });

  public projectsList$ = this.store.select(scopeOfWorkSelectors.projectsLight);
  public loading$ = this.store.select(scopeOfWorkSelectors.loading);
  public searchParam: Partial<IServerSideGetRowsRequestExtended>;

  constructor(
    public modal: BsModalRef,
    private fb: UntypedFormBuilder,
    private store: Store,
    private modalService: ModalService,
  ) {}

  public get isValidCheckboxes(): boolean {
    const formValues = this.copyForm.getRawValue();
    return Object.values(formValues).filter(j => typeof j === 'boolean').some(i => i);
  }

  public onCancel(): void {
    this.closeModal();
  }

  public onSave(): void {
    this.copyForm.removeControl('case');

    this.store.dispatch(
      scopeOfWorkActions.CopyProjectSettings({
        projectId: this.projectId,
        formValues: this.copyForm.value,
        callback: () => this.closeModal(),
      }),
    );
  }

  public onOpenProjectList(): void {
    this.modalService.show(ActiveProjectSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Project) => this.onProjectSelect(entity),
        projectId: this.projectId,
      },
      class: 'entity-selection-modal',
    });
  }

  public onProjectSelect(project: Project): void {
    this.copyForm.patchValue({
      case: project,
      caseIdFrom: project.id,
    });
  }

  protected closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }
}
