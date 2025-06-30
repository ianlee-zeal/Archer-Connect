import { ModalService } from '@app/services/modal.service';
import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { Store } from '@ngrx/store';
import { IdValue, Project } from '@app/models';
import { ProjectSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/project-selection-modal.component';
import * as actions from '../../state/actions';

export interface IGenerateFirmUpdateModalData {
  projectId: number;
}

@Component({
  selector: 'app-generate-firm-update-modal',
  templateUrl: './generate-firm-update-modal.component.html',
  styleUrls: ['./generate-firm-update-modal.component.scss'],
})
export class GenerateFirmUpdateModalComponent extends ValidationForm {
  title: string;
  saveHandler: (data: IGenerateFirmUpdateModalData) => (void) = null;

  awaitedActionTypes = [
    actions.DownloadProbatesDocument.type,
    actions.Error.type,
  ];

  form = new UntypedFormGroup({
    organization: new UntypedFormControl('', Validators.required),
    project: new UntypedFormControl(''),
  });

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  get isSaveDisabled(): boolean {
    return !this.form.get('project').value;
  }

  constructor(
    public readonly store: Store<any>,
    public readonly modalService: ModalService,
  ) {
    super();
  }

  public onClear(controlName: string): void {
    this.form.get(controlName).setValue(null);
    this.form.updateValueAndValidity();
  }

  onOpenProjectSelectModal(): void {
    this.modalService.show(ProjectSelectionModalComponent, {
      initialState: {
        orgId: (this.form.get('organization')?.value as IdValue).id,
        key: 'primaryOrgId',
        onEntitySelected: (project: Project) => {
          this.form.patchValue({ project: new IdValue(project.id, project.name) });
          this.form.updateValueAndValidity();
        },
      },
      class: 'entity-selection-modal',
    });
  }

  onSave(): void {
    if (this.saveHandler) {
      this.saveHandler({ projectId: (this.form.get('project').value as IdValue).id });
    }
  }

  onCancel(): void {
    this.modalService.hide();
  }
}
