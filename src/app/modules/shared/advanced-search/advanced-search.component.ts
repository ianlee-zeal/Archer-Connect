/* eslint-disable no-param-reassign */
import { Component, Output, EventEmitter, Input, ViewEncapsulation, OnInit, HostListener, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

import { CommonHelper } from '@app/helpers/common.helper';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchGroupType } from '@app/models/enums/search-group-type.enum';
import * as fromRoot from '@app/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { KeyCodes } from '@app/models/enums/keycodes.enum';
import { PermissionService } from '@app/services';
import { EntityTypeEnum } from '@app/models/enums';
import { savedSearchSelectors } from '../state/saved-search/selectors';
import { SelectOption } from '../_abstractions/base-select';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdvancedSearchComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public fields: SearchField[];
  @Input() public state: SearchState[];
  @Input() public savedSearchOptions: SelectOption[];
  @Input() public gridId: GridId;
  @Input() public entityId: number;
  @Input() public entityType: EntityTypeEnum;

  @Output() public markAsEdited = new EventEmitter();
  @Output() public onSearch = new EventEmitter();
  @Output() public onClear = new EventEmitter();

  public labelColor = '#303030';
  private ngUnsubscribe$ = new Subject<void>();
  public readonly groupTypes = SearchGroupType;
  public isDirty: boolean = false;
  public currentSearch$;
  public currentSearch: SelectOption = null;
  public isHidden: boolean = false;

  private _showExpandBtn = false;
  @Input() set showExpandBtn(value) {
    this._showExpandBtn  = value;
    this.isHidden = value;
  }

  get showExpandBtn(): boolean {
    return this._showExpandBtn;
  }

  constructor(
    public store: Store<fromRoot.AppState>,
    public router: Router,
    private readonly permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.currentSearch$ = this.store.select(savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
    this.currentSearch$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(result => {
        this.currentSearch = result && (!this.entityType || result?.entityType === this.entityType) ? { id: result?.id, name: result?.name } : null;
      });

    const fields = [];
    for (let i = 0; i < this.fields.length; i++) {
      const field = this.fields[i];
      if (!field.permissions || this.permissionService.has(field.permissions)) {
        fields.push(field);
      }
    }
    this.fields = [...fields];

    this.fields.sort((prev, current) => ((prev.name > current.name) ? 1 : -1));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { state } = this;
    const stateChanges = changes[CommonHelper.nameOf({ state })];

    if (stateChanges) {
      this.isDirty = false;
    }
  }

  trackByFn = (index: number): number => index;

  deleteEntry(index): void {
    if (index > -1 && this.state.length > 1) {
      this.state.splice(index, 1);
      this.markAsEdited.emit();
    }
  }

  goToSavedSearch(savedSearch: any): void {
    if (!savedSearch) {
      this.onClear.emit();
    }

    if (savedSearch && this.gridId) {
      switch (this.gridId) {
        case GridId.ProjectClaimantsOverview:
          if (this.entityId) {
            this.router.navigate([`/projects/${this.entityId}/claimants/tabs/overview/saved-search/${savedSearch.id}`]);
          }
          break;
        case GridId.Claimants:
          this.router.navigate([`/${this.gridId}/saved-search/${savedSearch.id}`]);
          break;
        case GridId.Probates:
          this.router.navigate([`/${this.gridId}/saved-search/${savedSearch.id}`]);
          break;
        case GridId.PaymentQueue:
          if (this.entityId) {
            this.router.navigate([`/projects/${this.entityId}/payments/tabs/payment-queue/saved-search/${savedSearch.id}`]);
          }
          break;
        case GridId.ClaimantSummaryList:
          if (this.entityId) {
            this.router.navigate([`/projects/${this.entityId}/payments/tabs/claimant-summary/saved-search/${savedSearch.id}`]);
          }
          break;
        case GridId.ClaimantSummaryRollupList:
          if (this.entityId) {
            this.router.navigate([`/projects/${this.entityId}/payments/tabs/claimant-summary-rollup/saved-search/${savedSearch.id}`]);
          }
          break;
        case GridId.GlobalPaymentQueue:
          this.router.navigate([`/payment-queue/tabs/list/saved-search/${savedSearch.id}`]);
          break;
        default:
          break;
      }
    }
  }

  addEntry(): void {
    this.state.push(new SearchState());
  }

  search(): void {
    if (!this.isValid) {
      return;
    }

    this.onSearch.emit();
  }

  private getAdditionalFields(field: SearchField): SearchState[] {
    let additionalFields: any[] = [];
    if (field && field.additionalFieldKeys && field.additionalFieldKeys.length) {
      additionalFields = field.additionalFieldKeys.map(additionField => ({
        field: additionField,
        additionalInfo: {},
        term: null,
        termTo: null,
        errors: {},
      }));
    }
    return additionalFields;
  }

  public onFieldChange(entry: SearchState, index: number, value: SearchField): void {
    if (value?.options && !(value?.options instanceof Observable)) {
      value.options.forEach(opt => { opt.checked = false; });
    }
    this.changeEntry({
      field: value,
      term: null,
      termTo: null,
      additionalFields: this.getAdditionalFields(value),
      additionalInfo: {},
      errors: {},
    }, index);

    entry = this.state[index];

    if (entry.field && !this.isDirty) { // form is dirty when user selected field name
      this.isDirty = true;
      this.markAsEdited.emit();
    }

    this.changeEntry({ condition: null }, index);

    entry = this.state[index];

    if (!entry.field && this.state.length === 1) { // user resets field name we have to reload grid without filters
      this.onSearch.emit();
    }
  }

  public toggleHidingAdvSearch(expanded): void {
    this.isHidden = !expanded;
  }

  public get isValid(): boolean {
    return !SearchState.hasErrors(this.state);
  }

  public getOperatorName(entry: SearchState): string {
    switch (entry?.field?.groupType) {
      case SearchGroupType.ClientWorkflowGroup:
        return 'or';
      default:
        return 'and';
    }
  }

  private changeEntry(entry: Partial<SearchState>, index: number): void {
    if (index < 0) {
      return;
    }

    const foundEntry = this.state[index];

    this.state.splice(index, 1, {
      ...foundEntry,
      ...entry,
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.code === KeyCodes.Enter) {
      this.search();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
