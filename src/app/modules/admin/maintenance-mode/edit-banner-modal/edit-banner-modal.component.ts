import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { QuillEditorHelper } from '@app/helpers/quill-editor.helper';
import { MaintenanceBanner } from '@app/models/admin/maintenance-banner';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { QuillModule } from 'ngx-quill';
import { Subject } from 'rxjs';
import * as maintenanceActions from '../state/actions';
import { MaintenanceState } from '../state/reducer';

@Component({
  selector: 'app-edit-banner-modal',
  templateUrl: './edit-banner-modal.component.html',
  styleUrls: ['./edit-banner-modal.component.scss'],
})
export class EditBannerModalComponent extends ValidationForm implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  public maintenanceBanner: MaintenanceBanner;

  public readonly editorModules: QuillModule = QuillEditorHelper.modules;

  public readonly awaitedActionTypes = [
    maintenanceActions.GetMaintenanceBannerListSuccess.type,
    maintenanceActions.Error.type,
    FormInvalid.type,
  ];

  public form: UntypedFormGroup = new UntypedFormGroup({
    text: new UntypedFormControl(null),
  });

  constructor(
    private store: Store<MaintenanceState>,
    public modalRef: BsModalRef,
  ) {
    super();
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public ngOnInit(): void {
    this.form.setValue({
      text: this.maintenanceBanner.description,
    });
  }

  public isEmptyRichText(content: string): boolean {
    if (!content) {
      return true;
    }
    const strippedContent = content.replace(/<\/?[^>]+(>|$)/g, '');
    return strippedContent.trim().length === 0;
  }

  public onSave(): void {
    this.maintenanceBanner.description = !this.isEmptyRichText(this.form.value.text) ? this.form.value.text : '';
    this.store.dispatch(maintenanceActions.UpdateMaintenanceBanner({ maintenanceBanner: this.maintenanceBanner }));
    this.modalRef.hide();
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
