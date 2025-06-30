import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

import { LedgerSetttingsFormSections } from '@app/models/enums/ledger-settings/form-sections';

import { SelectGroupsEnum } from '@app/models/enums/select-groups.enum';
import { LedgerSettingsState } from '../state/reducer';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ValidationForm } from '../../../shared/_abstractions/validation-form';
import { QSFType } from '../../../../models/enums/ledger-settings/qsf-type';
import { DocumentGenerationTemplates } from '@app/models/enums/document-generation/document-generation-templates';

@Component({
  selector: 'app-closing-statement-settings',
  templateUrl: './closing-statement-settings.component.html',
  styleUrls: ['./closing-statement-settings.component.scss'],
})
export class ClosingStatementSettingsComponent extends ValidationForm implements OnInit {
  public ngUnsubscribe$ = new Subject<void>();
  public closingStatementTemplateOptions: SelectOption[] = [];
  public importFeeAndExpenseTemplateOptions: SelectOption[] = [];
  public importDisbursementWorksheetTemplateOptions: SelectOption[] = [];
  public commonSettings$ = this.store.select(selectors.commonSettings);
  public closingStatementSettings$ = this.store.select(selectors.closingStatementSettings);
  public closingStatementSettings;
  public form: UntypedFormGroup;

  @Output() formChanged = new EventEmitter();
  @Output() formValid = new EventEmitter();

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public readonly formFields = {
    closingStatementTemplateId: 'closingStatementTemplateId',
    firmApprovedTemplate: 'firmApprovedTemplate',
    exportDetailedDisbursementWorksheetTemplateId: 'exportDetailedDisbursementWorksheetTemplateId',
    exportFirmFeeAndExpenseTemplateId: 'exportFirmFeeAndExpenseTemplateId',
  };

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly store: Store<LedgerSettingsState>,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.closingStatementSettings$
      .pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.closingStatementSettings = item;
        const { closingStatementTemplateOptions } = item.data;
        const projectSpecificTemplates = closingStatementTemplateOptions?.filter(v => v.group === SelectGroupsEnum.ProjectSpecificTemplates);
        const globalTemplates = closingStatementTemplateOptions?.filter(v => v.group === SelectGroupsEnum.GlobalTemplates);
        this.closingStatementTemplateOptions = [...projectSpecificTemplates, ...globalTemplates];

        this.importFeeAndExpenseTemplateOptions = item.data.importFeeAndExpenseTemplateOptions;
        this.importDisbursementWorksheetTemplateOptions = item.data.importDisbursementWorksheetTemplateOptions;
        this.setFormValues();
      });

    this.commonSettings$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        if (item.currentData.isQsfServiceChanged) {
          let exportDetailedDisbursementWorksheetTemplateId: DocumentGenerationTemplates = null;
          let exportFirmFeeAndExpenseTemplateId: DocumentGenerationTemplates = null;

          if (item.currentData.qsfProductId === QSFType.GrossToFirm) {
            exportDetailedDisbursementWorksheetTemplateId = DocumentGenerationTemplates.GTFExportTemplate;
            exportFirmFeeAndExpenseTemplateId = DocumentGenerationTemplates.FirmFeeExpenseTemplate;
          } else if (item.currentData.qsfProductId === QSFType.Enhanced) {
            exportDetailedDisbursementWorksheetTemplateId = DocumentGenerationTemplates.DetailedDisbursementWorksheet;
            exportFirmFeeAndExpenseTemplateId = DocumentGenerationTemplates.FirmFeeExpenseTemplate;
          }

          if (exportDetailedDisbursementWorksheetTemplateId || exportFirmFeeAndExpenseTemplateId) {
            this.closingStatementSettings.currentData.exportDetailedDisbursementWorksheetTemplateId = exportDetailedDisbursementWorksheetTemplateId;
            this.closingStatementSettings.currentData.exportFirmFeeAndExpenseTemplateId = exportFirmFeeAndExpenseTemplateId;
            this.setFormValues();
            this.onChanges();
          }
        }
      });
  }

  initForm(): void {
    this.form = this.fb.group({
      closingStatementTemplateId: [null],
      firmApprovedTemplate: [false],
      exportDetailedDisbursementWorksheetTemplateId: [null],
      exportFirmFeeAndExpenseTemplateId: [null],
    });
  }

  setFormValues() {
    this.form.setValue({
      closingStatementTemplateId: this.getTemplateId(this.closingStatementTemplateOptions, this.closingStatementSettings.currentData.closingStatementTemplateId),
      firmApprovedTemplate: this.closingStatementSettings.currentData.firmApprovedTemplate ?? false,
      exportDetailedDisbursementWorksheetTemplateId: this.getTemplateId(this.importDisbursementWorksheetTemplateOptions, this.closingStatementSettings.currentData.exportDetailedDisbursementWorksheetTemplateId),
      exportFirmFeeAndExpenseTemplateId: this.getTemplateId(this.importFeeAndExpenseTemplateOptions, this.closingStatementSettings.currentData.exportFirmFeeAndExpenseTemplateId),
    });
    this.setValidation();
  }

  getTemplateId(templates: SelectOption[], id: number): SelectOption {
    if (!!templates && templates.length > 0) {
      const selectedOptions = templates?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  private setValidation() {
    this.formValid.emit({
      formId: LedgerSetttingsFormSections.ClosingStatement,
      valid: this.validate(),
    });
  }

  public onChanges(): void {
    const closingStatementTemplateId: number = this.form.get(this.formFields.closingStatementTemplateId).value?.id;
    const firmApprovedTemplate: boolean = this.form.get(this.formFields.firmApprovedTemplate).value;
    const exportDetailedDisbursementWorksheetTemplateId: number = this.form.get(this.formFields.exportDetailedDisbursementWorksheetTemplateId).value?.id;
    const exportFirmFeeAndExpenseTemplateId: number = this.form.get(this.formFields.exportFirmFeeAndExpenseTemplateId).value?.id;

    this.store.dispatch(actions.updateClosingStatementSettingsCurrentData({
      closingStatementTemplateId,
      firmApprovedTemplate,
      exportDetailedDisbursementWorksheetTemplateId,
      exportFirmFeeAndExpenseTemplateId,
    }));

    this.setValidation();
    this.formChanged.emit();
  }
}
