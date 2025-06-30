import { Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { SavedSearch } from '@app/models/saved-search';
import { StringHelper } from '@app/helpers/string.helper';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { AdvancedSearchTypeEnum } from '@app/models/advanced-search/advanced-search-types.enum';
import { Subject } from 'rxjs';
import { SaveSearch } from '../../state/saved-search/actions';
import { SearchState } from '../../../../models/advanced-search/search-state';
import { savedSearchSelectors } from '../../state/saved-search/selectors';

@Component({
  selector: 'app-rename-search-modal',
  templateUrl: './rename-search-modal.component.html',
  styleUrls: ['./rename-search-modal.component.scss'],
})
export class RenameSearchModalComponent extends ValidationForm implements OnInit, OnDestroy {
  protected get validationForm(): UntypedFormGroup {
    return this.renameSearchForm;
  }

  private ngUnsubscribe$ = new Subject<void>();
  public currentSearch: SavedSearch;
  public searchState: SearchState[];

  public searchTypes = AdvancedSearchTypeEnum;

  renameSearchForm: UntypedFormGroup = new UntypedFormGroup({ nameSearch: new UntypedFormControl(null, [Validators.required]) });

  private savedSearchList: SavedSearch[];

  constructor(
    private store: Store<AppState>,
    private readonly renameSearchModalModal: BsModalRef,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.renameSearchForm.patchValue({ ...{ nameSearch: this.currentSearch.name } });
    this.store.select(savedSearchSelectors.savedSearchList)
      .pipe(first())
      .subscribe(savedSearchList => {
        this.savedSearchList = savedSearchList;
      });
  }

  public onSave(): void {
    if (!this.validate()) {
      return;
    }
    const search: SavedSearch = {
      ...this.currentSearch,
      name: this.renameSearchForm.controls.nameSearch.value,
      searchModel: this.searchState,
    };

    this.store.dispatch(SaveSearch({ search }));
    this.onCancel();
  }

  public onCancel(): void {
    this.renameSearchModalModal.hide();
  }

  validate(): boolean {
    if (!super.validate()) {
      return false;
    }

    const name = this.renameSearchForm.get('nameSearch');
    const exists = this.savedSearchList.find(item => StringHelper.equal(item.name, name.value)) !== undefined;
    if (exists) {
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
