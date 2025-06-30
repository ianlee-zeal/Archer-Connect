import { Component, OnInit, OnDestroy } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { IdValue } from '@app/models';
import { AuditorState } from '@app/modules/auditor/state/reducer';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';

import { AuditDocImportTemplate } from '@app/models/auditor/audit-doc-import-template';

import { AuditEnabledCollectorIds } from '@app/models/enums';

import { SearchTypeEnum } from '@app/models/enums/filter-type.enum';
import { SearchOptionsHelper } from '@app/helpers';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { auditBatchModalSelectors } from '../../state/selectors';
import * as auditBatchModalActions from '../../state/actions';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Component({
  selector: 'app-audit-batch-template',
  templateUrl: './audit-batch-template.component.html',
  styleUrls: ['./audit-batch-template.component.scss'],
})
export class AuditBatchTemplateStepComponent extends ValidationForm implements OnInit, OnDestroy {
  public readonly dropdownValues$ = this.store.select(auditBatchModalSelectors.dropdownValues);
  public dropdownValues;
  public form: UntypedFormGroup;
  public filteredTemplates: AuditDocImportTemplate[];

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get isDisabledTemplateSelect(): boolean {
    return !this.form.controls.collector.value;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private readonly store: Store<AuditorState>,
  ) {
    super();
  }

  ngOnInit() {
    this.createForm();
    this.getDropdownValues();

    this.dropdownValues$.pipe(
      filter(dropdownValues => !!dropdownValues?.templates && !!dropdownValues?.collectors),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.dropdownValues = dropdownValues;
    });
  }

  private createForm() {
    this.form = this.fb.group({
      collector: [null, Validators.required],
      template: [null, Validators.required],
    });

    super.validate();
  }

  private getDropdownValues() {
    const searchOptions: IServerSideGetRowsRequestExtended = SearchOptionsHelper.getFilterRequest([
      SearchOptionsHelper.getContainsFilter('collectorId', FilterTypes.Number, SearchTypeEnum.Contains, AuditEnabledCollectorIds.join(',')),
    ]);
    searchOptions.endRow = -1;

    this.store.dispatch(auditBatchModalActions.GetDropdownValues({ searchOptions }));
  }

  public onCollectorChange(selectedCollector: IdValue): void {
    if (!selectedCollector) {
      this.onTemplateChange(null, true);
      return;
    }

    this.filteredTemplates = this.dropdownValues.templates.filter(item => item.collectorId === selectedCollector.id);
    const defaultTemplate = this.filteredTemplates.length ? this.filteredTemplates.find(item => item.isDefault) || this.filteredTemplates[0] : null;

    this.onTemplateChange(defaultTemplate, true);
  }

  public onTemplateChange(template: AuditDocImportTemplate, updateTemplateControl: boolean = false): void {
    if (updateTemplateControl) {
      this.form.controls.template.setValue(template);
    }

    this.store.dispatch(auditBatchModalActions.SetTemplate({ template }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
