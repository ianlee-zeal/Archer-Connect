import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import * as selectors from '../state/org-impersonate/selectors';
import * as actions from '../state/org-impersonate/actions';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { filter, takeUntil } from 'rxjs/operators';
import * as fromAuth from '@app/modules/auth/state';
import { SearchOptionsHelper } from '@app/helpers';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { FilterModelOperation } from '@app/models/advanced-search/filter-model-operation.enum';
import { Subject } from 'rxjs';
import { OrgImpersonateRequest } from '@app/models/org-impersonate-request';
import { ToastService } from '@app/services';
import { UserInfo } from '@app/models';
import { IServerSideGetRowsRequestExtended } from '../_interfaces/ag-grid/ss-get-rows-request';
import { OrgType } from '@app/models/enums/org-type.enum';

@Component({
  selector: 'app-org-impersonate-dialog',
  templateUrl: './org-impersonate-dialog.component.html',
  styleUrls: ['./org-impersonate-dialog.component.scss']
})
export class OrgImpersonateDialogComponent implements OnInit, OnDestroy {
  public user$ = this.store.select<any>(fromAuth.authSelectors.getUser);
  public currentOrgId: number;
  public selectedOrgId: number | null = null;
  public form: UntypedFormGroup;

  orgsOptions$ = this.store.select(selectors.orgsOptions);
  orgsOptions: SelectOption[];
  orgsLoading$ = this.store.select(selectors.orgsOptionsLoading);
  orgsLoading: boolean = false;

  rolesOptions$ = this.store.select(selectors.rolesOptions);
  rolesOptions: SelectOption[];

  selectedRoles: SelectOption[] = [];
  rolesLoading$ = this.store.select(selectors.rolesOptionsLoading);
  rolesLoading: boolean = false;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromAuth.AppState>,
    public modal: BsModalRef,
    private readonly toaster: ToastService,) {
  }

  ngOnInit() {
    this.form = new UntypedFormGroup({
      filter: new UntypedFormControl()
    });
    this.subscribeToOrgsOptions();
    this.subscribeToRolesOption();
    this.subscribeToUser();
    this.fetchOrgs(null);
  }

  subscribeToOrgsOptions(): void {
    this.orgsOptions$
      .pipe(
        filter((x: SelectOption[]) => !!x),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((orgsOptions: SelectOption[]) => {
        this.orgsOptions = [...orgsOptions];
      });
    this.orgsLoading$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((inProgress: boolean) => {
        this.orgsLoading = inProgress;
      });
  }

  subscribeToRolesOption(): void {
    this.rolesOptions$
      .pipe(
        filter((x: SelectOption[]) => !!x),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((rolesOptions: SelectOption[]) => {
        this.rolesOptions = [...rolesOptions];
      });
    this.rolesLoading$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((inProgress: boolean) => {
        this.rolesLoading = inProgress;
      });
  }

  subscribeToUser(): void{
    this.user$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.currentOrgId = user.defaultOrganization?.id;
    });
  }

  public onImpersonate(): void {
    if (this.selectedOrgId && this.selectedRoles.length) {
      const selectedRolesIds = this.selectedRoles.map(role => role.id).filter(id => typeof id === 'number') as number[];
      const impersonateRequest = new OrgImpersonateRequest(this.selectedOrgId, selectedRolesIds);
      this.store.dispatch(actions.ImpersonateOrgRequest({ impersonateRequest: impersonateRequest }));
    } else{
      this.toaster.showError('Must select org and one or more roles');
    }
  }

  public onCancel(): void {
    this.modal.hide();
  }

  public fetchOrgs(term: string): void {
    const termConditions: FilterModel[] = [];
    if (term) {
      termConditions.push(SearchOptionsHelper.getContainsFilter('name', 'text', 'contains', term));

      if (!Number.isNaN(Number.parseInt(term, 10))) {
        termConditions.push(SearchOptionsHelper.getNumberFilter('id', 'number', 'equals', parseInt(term, 10)));
      }
    }

    const masterCondition: FilterModel = SearchOptionsHelper.getBooleanFilter('isMaster', 'boolean', 'equals', false);
    const currentOrgIdCondition: FilterModel = SearchOptionsHelper.getNumberFilter('id', 'number', 'notEqual', this.currentOrgId);

    const lawFirmOrgTypes = [
      OrgType.DefenseFirm,
      OrgType.LawFirm,
      OrgType.PrimaryFirm,
      OrgType.ReferringFirm,
      OrgType.SettlementFirm
    ];
    const primaryOrgTypeConditions: FilterModel[] = lawFirmOrgTypes.map(typeId => SearchOptionsHelper.getNumberFilter('primaryOrgTypeId', 'number', 'equals', parseInt(typeId, 10)));
    const lawFirmTypeCondition: FilterModel = new FilterModel({ operation: FilterModelOperation.Or, conditions: primaryOrgTypeConditions });

    const search: IServerSideGetRowsRequestExtended = {
      endRow: 25,
      startRow: 0,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      filterModel: termConditions.length > 0
        ? [
          new FilterModel({
            operation: FilterModelOperation.And,
            conditions: [
              new FilterModel({
                operation: FilterModelOperation.Or,
                conditions: termConditions,
              }),
              masterCondition,
              currentOrgIdCondition,
              lawFirmTypeCondition
            ],
          }),
        ]
        : [masterCondition, currentOrgIdCondition, lawFirmTypeCondition],
      sortModel: [{ sort: 'asc', colId: 'name' }]
    }

    this.store.dispatch(actions.GetOrgsOptionsRequest({ search }));
  }

  onOrgModelChange(event: any): void{
    this.selectedOrgId = event ? event.id : null;
  }

  onSelectedOrgChange(value: any): void {
      this.store.dispatch(actions.GetRolesOptionsRequest({ orgId: value }));
  }

  onSelectedOrgClear(): void{
    this.selectedOrgId = null;
    this.selectedRoles = [];
    this.store.dispatch(actions.ClearOrgsOptions());
  }

  public searchFn(): boolean {
    return true;
  }

  onSelectedRolesClear() : void{
    this.selectedRoles = [];
    this.rolesOptions = this.rolesOptions.map(
      item => ({ ...item, checked: false })
    );
  }

  updateSelectedRoles(value: SelectOption[]): void {
    this.selectedRoles = value;
    this.rolesOptions = this.rolesOptions.map(
      item => ({ ...item, checked: value.includes(item) })
    );
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
