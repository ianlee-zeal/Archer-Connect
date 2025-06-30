import { Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';

import { SavedSearch } from '@app/models/saved-search';
import { StringHelper } from '@app/helpers/string.helper';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { AdvancedSearchTypeEnum } from '@app/models/advanced-search/advanced-search-types.enum';
import { Observable, Subject } from 'rxjs';
import { ValidationService } from '@app/services';
import { GetUsersOptionsRequest, SaveSearch } from '../../state/saved-search/actions';
import { EntityTypeEnum } from '../../../../models/enums/entity-type.enum';
import { SearchState } from '../../../../models/advanced-search/search-state';
import { savedSearchSelectors } from '../../state/saved-search/selectors';

@Component({
  selector: 'app-save-search-modal',
  templateUrl: './save-search-modal.component.html',
  styleUrls: ['./save-search-modal.component.scss'],
})
export class SaveSearchModalComponent extends ValidationForm implements OnInit, OnDestroy {
  protected get validationForm(): UntypedFormGroup {
    return this.saveSearchForm;
  }
  private ngUnsubscribe$ = new Subject<void>();

  public users$ = this.store.select(savedSearchSelectors.orgUsersOptions);

  public currentSelectedOrgId: number;
  public entityType: EntityTypeEnum;
  public currentSearch: SavedSearch;
  public searchState: SearchState[];
  public isEdit: boolean;
  public searchId: number;
  public currentSearch$: Observable<any>;
  public projectId: number;

  public searchTypes = AdvancedSearchTypeEnum;

  saveSearchForm: UntypedFormGroup = new UntypedFormGroup({
    nameSearch: new UntypedFormControl(null, ValidationService.requiredAndNoWhitespaceBeforeTextValidator),
    shareWith: new UntypedFormControl(null, Validators.required),
    advancedSearchType: new UntypedFormControl(this.searchTypes.Private),
  });

  public get title() : string {
    return this.isEdit ? 'Edit' : 'Save Search';
  }

  public get isSharedChecked() : boolean {
    return this.saveSearchForm.controls.advancedSearchType.value === this.searchTypes.Shared;
  }

  private savedSearchList: SavedSearch[];

  constructor(
    private readonly store: Store<AppState>,
    private readonly saveSearchModalModal: BsModalRef,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.currentSearch$ = this.store.select(savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
    this.currentSearch$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(n => !!n && n.id === this.searchId),
    ).subscribe(savedSearch => {
      this.currentSearch = savedSearch;
      this.saveSearchForm.patchValue({
        ...{
          nameSearch: savedSearch.name,
          shareWith: savedSearch.users,
          advancedSearchType: savedSearch.advancedSearchType,
        },
      });
      this.toggleRequiredValidator('shareWith', this.isSharedChecked);
    });

    this.store.select(savedSearchSelectors.savedSearchList)
      .pipe(first())
      .subscribe(savedSearchList => {
        this.savedSearchList = savedSearchList;
      });

    this.store.dispatch(GetUsersOptionsRequest({ orgId: this.currentSelectedOrgId }));
    this.toggleRequiredValidator('shareWith', this.isSharedChecked);
  }

  public onSave(): void {
    if (!this.validate()) {
      return;
    }
    const searchState: SearchState[] = this.searchState
      ? this.searchState.map(search => SearchState.toDto(search))
      : this.currentSearch.searchModel.map(search => SearchState.toDto(search));

    this.store.dispatch(SaveSearch({
      search: {
        entityType: this.entityType,
        name: this.saveSearchForm.controls.nameSearch.value,
        searchModel: searchState,
        id: this.isEdit && this.currentSearch.id,
        advancedSearchType: this.saveSearchForm.controls.advancedSearchType.value,
        orgId: this.currentSelectedOrgId,
        users: this.saveSearchForm.controls.shareWith.value,
        projectId: this.projectId,
      } as SavedSearch,
    }));
    this.onCancel();
  }

  public onCancel(): void {
    this.saveSearchModalModal.hide();
  }

  public fetch(term: any) {
    this.store.dispatch(GetUsersOptionsRequest({ orgId: this.currentSelectedOrgId, search: { searchTerm: term } }));
  }

  public searchFn() {
    return true;
  }

  public onChangeType() {
    this.toggleRequiredValidator('shareWith', this.isSharedChecked);
  }

  private toggleRequiredValidator(controlName: string, condition: boolean): void {
    const control = this.saveSearchForm.controls[controlName];
    if (condition) {
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
    } else {
      control.setValidators(null);
      control.updateValueAndValidity();
    }
  }

  validate(): boolean {
    if (!super.validate()) {
      return false;
    }

    const name = this.saveSearchForm.get('nameSearch');
    const exists = this.savedSearchList.find(item => StringHelper.equal(item.name, name.value)) !== undefined;
    if (exists && !this.isEdit) {
      name.setErrors({ nameExists: 'Saved search with the same name already exists.' });
      return false;
    }
    return true;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
