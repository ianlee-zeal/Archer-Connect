import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ModalService, PermissionService, ToastService } from '@app/services';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Router } from '@angular/router';
import { CreateOrganizationAccessModalComponent } from '@app/modules/shared/create-organization-access-modal/create-organization-access-modal.component';
import { OrganizationEntityAccess } from '@app/models/organization-entity-access';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ClaimantDetailsState } from '../state/reducer';
import * as actions from '../state/actions';
import { DateFormatPipe } from '../../../shared/_pipes';
import * as fromClaimants from '../state/selectors';
import { RepresentativeActionsRenderComponent } from './representative-actions-render/representative-actions-render.component';
import { CreatePager, GotoParentView } from '../../../shared/state/common.actions';

@Component({
  selector: 'app-representatives',
  templateUrl: './representatives.component.html',
  styleUrls: ['./representatives.component.scss'],
})
export class RepresentativesComponent extends ListView implements OnInit, OnDestroy {
  public ngDestroyed$ = new Subject<void>();

  public readonly gridId: GridId = GridId.Representatives;

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Name',
        field: 'organizationName',
        colId: 'Organization.Name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'Type',
        field: 'organizationTypeName',
        width: 160,
        sortable: true,
        colId: 'OrganizationType.Name',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'External ID',
        field: 'externalId',
        width: 175,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },

      AGGridHelper.getActionsColumn({
        editHandler: this.onEditHandler.bind(this),
        viewOrgDetailsHandler: this.onViewOrgDetailsHandler.bind(this),
      }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { buttonRenderer: RepresentativeActionsRenderComponent },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public item$ = this.store.select(fromClaimants.item);

  public ngUnsubscribe$ = new Subject<void>();
  private organizationAccess$ = this.store.select(fromClaimants.organizationAccess);
  private claimantId: number;
  private organizationAccess: OrganizationEntityAccess[];

  constructor(
    private store: Store<ClaimantDetailsState>,
    private datePipe: DateFormatPipe,
    private modalService: ModalService,
    private readonly toaster: ToastService,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  private readonly actionBar: ActionHandlersMap = {
    linkExisting: {
      callback: () => this.openModal(),
      permissions: PermissionService.create(PermissionTypeEnum.ClientOrgAccess, PermissionActionTypeEnum.Create),
    },
    back: () => this.back(),
  };

  public ngOnInit(): void {
    this.item$.pipe(
      filter(claimant => !!claimant),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(claimant => {
        this.claimantId = claimant.id;
      });

    this.organizationAccess$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(orgAccess => {
        this.organizationAccess = orgAccess;
      });

    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: this.actionBar }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(actions.GetOrganizationAccessRequest({ agGridParams: params, claimantId: this.claimantId }));
  }

  private back(): void {
    this.store.dispatch(GotoParentView());
  }

  private openCreateOrgAccessModal(data, isEditMode: boolean): void {
    const record = this.organizationAccess.find(value => value.id === data.id);
    const initialState = { organizationAccess: record, editMode: isEditMode };

    this.openModal(initialState);
  }

  private onEditHandler({ data }): void {
    this.openCreateOrgAccessModal(data, true);
  }

  protected onRowDoubleClicked(event): void {
    if (!event.data) {
      return;
    }

    this.openCreateOrgAccessModal(event.data, false);
  }

  private onViewOrgDetailsHandler({ data }): void {
    if (data.deleted) {
      this.toaster.showWarning('Organization has been deleted.');
      return;
    }

    const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
    this.store.dispatch(
      CreatePager({
        relatedPage: RelatedPage.Representatives,
        settings: navSettings,
      }),
    );

    const { url } = this.router;
    this.router.navigate([`admin/user/orgs/${data.organizationId}`], { state: { orgPreviousUrl: url } });
  }

  private openModal(initialState?): void {
    this.modalService.show(CreateOrganizationAccessModalComponent, {
      initialState,
      class: 'representative-modal',
    });
  }
}
