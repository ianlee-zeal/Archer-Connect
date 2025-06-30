import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { AuditorState } from '@app/modules/auditor/state/reducer';
import { auditBatchModalSelectors } from '../../state/selectors';

import * as auditBatchModalActions from '../../state/actions';

@Component({
  selector: 'app-audit-batch-settings',
  templateUrl: './audit-batch-settings.component.html',
  styleUrls: ['./audit-batch-settings.component.scss'],
})
export class AuditBatchSettingsStepComponent extends ValidationForm implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();
  private runSettings$ = this.store.select(auditBatchModalSelectors.runSettings);

  public form: UntypedFormGroup;

  public runSettings: string;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private readonly store: Store<AuditorState>,
  ) {
    super();
  }

  ngOnInit() {
    this.createForm();

    this.runSettings$
      .pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.runSettings = item;
        this.setFormValues();
      });
  }

  private createForm() {
    this.form = this.fb.group({ enableDuplicateDetection: null });
  }

  setFormValues() {
    this.form.setValue({ enableDuplicateDetection: JSON.parse(this.runSettings).DuplicateDetectionEnable });

    this.onChanges();
  }

  public onChanges(): void {
    const enableDuplicateDetection: boolean = this.form.get('enableDuplicateDetection').value;
    this.store.dispatch(auditBatchModalActions.SetSettings({ settings: { DuplicateDetectionEnable: enableDuplicateDetection } }));
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
