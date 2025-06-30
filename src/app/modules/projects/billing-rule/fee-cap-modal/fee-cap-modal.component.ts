import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastService, ValidationService } from '@app/services';
import { Subject } from 'rxjs';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { ToggleState } from '@app/models/enums/toggle-state.enum';
import { takeUntil } from 'rxjs/operators';
import { BillingRulesToFeeCapDto, FeeCap, FeeCapDto, IRelatedContractRules } from '@app/models/billing-rule/fee-cap';
import { ofType } from '@ngrx/effects';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';

export interface FeeCapModalInitial {
  id?: number;
  projectId: number;
}

export interface FeeCapModalFormValue {
  id?: number;
  projectId: number;
}

@Component({
  selector: 'app-fee-cap-modal',
  templateUrl: './fee-cap-modal.component.html',
  styleUrls: ['./fee-cap-modal.component.scss'],
})
export class FeeCapModalComponent extends ValidationForm implements OnInit, OnDestroy {
  // initial modal state ---
  public feeCap?: FeeCap;
  public projectId: number;
  // -----------------------

  public injuryCategories$ = this.store.select(selectors.injuryCategories);
  private ngUnsubscribe$ = new Subject<void>();
  public relatedContractRules: IRelatedContractRules[] = [];

  public readonly awaitedSaveActionTypes = [
    actions.CreateFeeCapSuccess.type,
    actions.UpdateFeeCapSuccess.type,
    actions.Error.type,
  ];

  public get title() {
    return this.feeCap ? 'Edit Fee Cap' : 'Add Fee Cap';
  }

  public get awardBasedCap() {
    return this.isTrue(this.form, 'awardBasedCap');
  }

  public get cappedPriceSwitcher() {
    return this.form.get('cappedPriceSwitcher')?.value;
  }

  constructor(
    private store: Store<AppState>,
    private modalWindow: BsModalRef,
    private toaster: ToastService,
    private actionsSubj: ActionsSubject,
  ) { super(); }

  ngOnInit(): void {
    this.store.dispatch(actions.SearchInjuryCategories({ term: this.feeCap?.injuryCategory?.name || '' }));

    if (this.feeCap) {
      this.initValuesForEditing();
    }

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.CreateFeeCapSuccess,
        actions.UpdateFeeCapSuccess,
        actions.Error,
      ),
    ).subscribe(() => {
      this.modalWindow.hide();
    });

    this.form.get('cappedPriceSwitcher').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(value => {
        const cappedPrice = this.form.get('cappedPrice');
        const cappedPricePct = this.form.get('cappedPricePct');
        if (!value) {
          cappedPrice?.setValidators(Validators.required);
          cappedPrice?.updateValueAndValidity();
          cappedPricePct?.clearValidators();

          cappedPricePct?.patchValue(null);
          cappedPricePct?.updateValueAndValidity();
        } else {
          cappedPricePct?.setValidators(Validators.required);
          cappedPricePct?.updateValueAndValidity();
          cappedPrice?.clearValidators();

          cappedPrice?.patchValue(null);
          cappedPrice?.updateValueAndValidity();
        }
      });
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get isSaveDisabled(): boolean {
    return this.form.invalid
      || !this.relatedContractRules
      || this.relatedContractRules.length === 0;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl('', Validators.required),
    description: new UntypedFormControl(''),
    awardBasedCap: new UntypedFormControl(false),
    cappedPrice: new UntypedFormControl(null, [ValidationService.onlyNumbersValidator, Validators.required]),
    cappedPricePct: new UntypedFormControl(null, [ValidationService.onlyNumbersValidator]),
    cappedPriceSwitcher: new UntypedFormControl(null),
    settlementAmountRange: new UntypedFormControl(null),
    injuryCategory: new UntypedFormControl(null),
  });

  public onCheck(controlName: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.form.get(controlName).patchValue(isChecked);
    this.form.markAsDirty();
  }

  public onSave() {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    if (this.feeCap) {
      const dto: FeeCapDto = {
        id: this.feeCap.id,
        name: this.form.value.name,
        cappedPrice: this.form.value.cappedPrice,
        cappedPricePct: this.form.value.cappedPricePct,
        description: this.form.value.description,
        isAwardBased: this.form.value.awardBasedCap,
        minSettlementAmount: this.form.value.awardBasedCap ? this.form.value.settlementAmountRange?.lower || null : null,
        maxSettlementAmount: this.form.value.awardBasedCap ? this.form.value.settlementAmountRange?.upper || null : null,
        injuryCategoryId: this.form.value.awardBasedCap ? this.form.value.injuryCategory?.id : null,
        projectId: this.projectId,
        injuryCategory: null,
        billingRulesToFeeCaps: this.getBillingRulesToFeeCaps(this.feeCap.id, this.feeCap.billingRulesToFeeCaps),
      };
      this.store.dispatch(actions.UpdateFeeCap({ dto }));
    } else {
      const dto: FeeCapDto = {
        id: 0,
        name: this.form.value.name,
        cappedPrice: this.form.value.cappedPrice,
        cappedPricePct: this.form.value.cappedPricePct,
        description: this.form.value.description,
        isAwardBased: this.form.value.awardBasedCap,
        minSettlementAmount: this.form.value.awardBasedCap ? this.form.value.settlementAmountRange?.lower || null : null,
        maxSettlementAmount: this.form.value.awardBasedCap ? this.form.value.settlementAmountRange?.upper || null : null,
        injuryCategoryId: this.form.value.awardBasedCap ? this.form.value.injuryCategory?.id : null,
        projectId: this.projectId,
        injuryCategory: null,
        billingRulesToFeeCaps: this.getBillingRulesToFeeCaps(0),
      };
      this.store.dispatch(actions.CreateFeeCap({ dto }));
    }
  }

  public cancel() {
    this.modalWindow.hide();
  }

  private initValuesForEditing(): void {
    this.relatedContractRules = this.feeCap?.billingRulesToFeeCaps?.map(b => ({
      key: b.billingRuleId,
      selected: true,
      value: '',
    })) || [];
    const cappedPriceSwitcher = !this.feeCap?.cappedPrice && !!this.feeCap?.cappedPricePct;
    const patch: any = {
      name: this.feeCap?.name,
      description: this.feeCap?.description,
      awardBasedCap: this.feeCap?.isAwardBased,
      cappedPrice: this.feeCap?.cappedPrice,
      cappedPricePct: this.feeCap?.cappedPricePct,
      cappedPriceSwitcher,
      settlementAmountRange: {
        lower: this.feeCap?.minSettlementAmount,
        upper: this.feeCap?.maxSettlementAmount,
      },
      injuryCategory: this.feeCap?.injuryCategory,
    };

    this.form.patchValue(patch);
    this.form.updateValueAndValidity();

    const cappedPrice = this.form.get('cappedPrice');
    const cappedPricePct = this.form.get('cappedPricePct');
    if (!cappedPriceSwitcher) {
      cappedPrice?.setValidators(Validators.required);
      cappedPrice?.updateValueAndValidity();
      cappedPricePct?.clearValidators();
    } else {
      cappedPricePct?.setValidators(Validators.required);
      cappedPricePct?.updateValueAndValidity();
      cappedPrice?.clearValidators();
    }
  }

  public onEntitySelect(entities: any[]) {
    this.relatedContractRules = entities;
  }

  public onSearchInjuryCategory(term: string): void {
    this.store.dispatch(actions.SearchInjuryCategories({ term }));
  }

  public searchFn = () => true;

  isTrue(form: UntypedFormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return control?.value === ToggleState.Yes || control?.value === true;
  }

  getBillingRulesToFeeCaps(feeCapId: number, billingRulesToFeeCaps?: BillingRulesToFeeCapDto[]) {
    return this.relatedContractRules.map(r => {
      const existingBillingRule = billingRulesToFeeCaps?.find(bfc => bfc.billingRuleId === r.key);
      if (existingBillingRule) {
        return { ...existingBillingRule } as BillingRulesToFeeCapDto;
      }
      return {
        id: 0,
        billingRuleId: r.key,
        feeCapId,
      } as BillingRulesToFeeCapDto;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.relatedContractRules = [];
    this.feeCap = undefined;
  }
}
