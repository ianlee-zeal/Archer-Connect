import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { LedgerSetttingsFormSections } from '@app/models/enums/ledger-settings/form-sections';
import { QSFType } from '@app/models/enums/ledger-settings/qsf-type';
import { FormulaModeEnum } from '@app/models/enums/ledger-settings/formula-mode.enum';
import { FormulaSetsEnum } from '@app/models/enums/ledger-settings/formula-sets.enum';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { LedgerSettingsState } from '../state/reducer';

@Component({
  selector: 'app-formula-settings',
  templateUrl: './formula-settings.component.html',
  styleUrls: ['./formula-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormulaSettingsComponent extends ValidationForm implements OnInit {
  public ngUnsubscribe$ = new Subject<void>();

  public formulaSettings$ = this.store.select(selectors.formulaSettings);
  public commonSettings$ = this.store.select(selectors.commonSettings);
  public formulaSettings;

  public isQsfGrossFirm = false;

  public form: UntypedFormGroup;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  @Output() formValid = new EventEmitter();
  @Output() formChanged = new EventEmitter();

  public readonly formFields = {
    formulaModeId: 'formulaModeId',
    formulaSetId: 'formulaSetId',
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
    this.setFormValues();
  }

  loadSubscriptions() {
    this.formulaSettings$
      .pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.formulaSettings = item;
      });

    this.commonSettings$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.isQsfGrossFirm = item.currentData.qsfProductId === QSFType.GrossToFirm;
        if (this.isQsfGrossFirm) {
          if (item.currentData.isQsfServiceChanged) {
            this.formulaSettings.currentData.formulaModeId = FormulaModeEnum.Fee;
            this.formulaSettings.currentData.formulaSetId = FormulaSetsEnum.FormulaSetV1;
          }
          this.setFormValues();
          this.onChanges();
        }
      });
  }

  initForm(): void {
    this.form = this.fb.group({
      formulaModeId: [null, Validators.required],
      formulaSetId: [null, Validators.required],
    });
  }

  setFormValues() {
    if (this.formulaSettings.currentData.formulaSetId) {
      this.filterFormulaCalculationStepOptions(this.formulaSettings.currentData.formulaSetId);
    }

    this.form.setValue({
      formulaModeId: this.filterFromSelectOptions(this.formulaSettings.formulaModeIdOptions, this.isQsfGrossFirm ? FormulaModeEnum.Fee : this.formulaSettings.currentData.formulaModeId),
      formulaSetId: this.filterFromSelectOptions(this.formulaSettings.formulaSetIdOptions, this.formulaSettings.currentData.formulaSetId),
    });
    this.setValidation();
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  public OnTemplateChange(): void {
    const formulaSetId: number = this.form.get(this.formFields.formulaSetId).value?.id;
    this.filterFormulaCalculationStepOptions(formulaSetId);
    this.setValidation();
    this.formChanged.emit();
  }

  public onChanges(): void {
    const formulaModeId: number = this.form.get(this.formFields.formulaModeId).value?.id;
    const formulaSetId: number = this.form.get(this.formFields.formulaSetId).value?.id;

    this.store.dispatch(actions.updateFormulaSettingsCurrentData({
      formulaSetId,
      formulaModeId,
    }));

    this.setValidation();
    this.formChanged.emit();
  }

  filterFormulaCalculationStepOptions(formulaSetId: number) {
    this.store.dispatch(actions.filterFormulaCalculationStepOptions({ formulaSetId }));
  }

  private setValidation() {
    this.formValid.emit({
      formId: LedgerSetttingsFormSections.FormulaSettings,
      valid: this.validate(),
    });
  }
}
