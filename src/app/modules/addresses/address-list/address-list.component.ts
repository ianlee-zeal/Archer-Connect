import { filter, first, takeUntil } from 'rxjs/operators';
import { Component, OnInit, Input, OnDestroy, ElementRef } from '@angular/core';

import { GridOptions, GridApi } from 'ag-grid-community';
import { Store } from '@ngrx/store';

import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { EntityAddress } from '@app/models/entity-address';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { PermissionService } from '@app/services';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Router } from '@angular/router';
import { ValueWithTooltipRendererComponent } from '@app/modules/shared/_renderers/value-with-tooltip-renderer/value-with-tooltip-renderer.component';
import * as fromShared from '../../shared/state';
import { AddressesListSearchParams } from './state/actions';
import { AddressListActionsRendererComponent } from './address-list-actions-renderer/address-list-actions-renderer.component';
import { GridCheckmarkRendererComponent } from '../../shared/grid-checkmark-renderer/grid-checkmark-renderer.component';
import { PrimaryTagRendererComponent } from '../../shared/_renderers/primary-tag-renderer/primary-tag-renderer.component';
import { CheckboxEditorRendererComponent } from '../../shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { Policy } from '../../auth/policy';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const { sharedActions } = fromShared;

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss'],
})
export class AddressListComponent extends ListView implements OnInit, OnDestroy {
  @Input() public entityId: number;

  @Input() public entityName: string;

  @Input() public entityType: EntityTypeEnum;

  @Input() public gridId: GridId;

  private get showAddresseeAndAttnTo() {
    return this.gridId == GridId.OrgAddresses;
  }

  public readonly addresses$ = this.store.select(fromShared.sharedSelectors.addressesListSelectors.addressesList);
  private readonly canViewAuditInfoPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.ClaimantAddress));

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    components: {
      buttonRenderer: AddressListActionsRendererComponent,
      checkMarkRenderer: GridCheckmarkRendererComponent,
      primaryRenderer: PrimaryTagRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
      valueWithTooltip: ValueWithTooltipRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private store: Store<fromShared.AppState>,
    private datePipe: DateFormatPipe,
    private readonly permissionService: PermissionService,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  private setColumnDefs() {
    this.gridOptions.columnDefs = [
      {
        headerName: 'Primary',
        field: 'isPrimary',
        sortable: true,
        cellRenderer: 'primaryRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Active',
        field: 'isActive',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Type',
        field: 'type.name',
        width: 40,
        resizable: true,
        sortable: true,
        cellRenderer: 'valueWithTooltip',
      },
      {
        headerName: 'Addressee',
        field: 'addressee',
        sortable: true,
        hide: !this.showAddresseeAndAttnTo,
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'Attn To',
        field: 'attnTo',
        sortable: true,
        hide: !this.showAddresseeAndAttnTo,
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'Address Line 1',
        field: 'line1',
        sortable: true,
        ...AGGridHelper.addressColumnDefaultParams,
        cellRenderer: 'valueWithTooltip',
      },
      {
        headerName: 'Address Line 2',
        field: 'line2',
        sortable: true,
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'City',
        field: 'city',
        sortable: true,
        ...AGGridHelper.cityColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'state',
        sortable: true,
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Zip Code',
        field: 'zip',
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
        width: 100,
        minWidth: 100,
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        hide: !this.canViewAuditInfoPermission,
      },
      {
        headerName: 'Source',
        field: 'dataSourceName',
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
        width: 130,
        hide: !this.canViewAuditInfoPermission,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        valueFormatter: params => this.datePipe.transform(params.node.data && params.node.data.createdDate, false, null, null, true),
        sortable: true,
        ...AGGridHelper.dateColumnDefaultParams,
        hide: !this.canViewAuditInfoPermission,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        valueFormatter: params => this.datePipe.transform(params.node.data && params.node.data.lastModifiedDate, false, null, null, true),
        sortable: true,
        ...AGGridHelper.dateColumnDefaultParams,
        minWidth: 160,
        hide: !this.canViewAuditInfoPermission,
      },
      AGGridHelper.getActionsColumn({
        viewAddressHandler: this.onRowDoubleClicked.bind(this),
        editAddressHandler: this.onEditAddressActionClicked.bind(this),
        setPrimaryAddressHandler: this.onSetPrimaryAddressHandler.bind(this),
      }),
    ]
  }

  public ngOnInit(): void {
    this.store.dispatch(sharedActions.addressesListActions.UpdateAddressesListActionBar({
      actionBar: {
        new: {
          callback: () => { this.addAddress(); },
          permissions: PermissionService.create(Policy.getAddresses(this.entityType), PermissionActionTypeEnum.Create),
        },
      },
    }));

    this.addresses$.pipe(
      filter(addresses => !!addresses),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(addresses => {
      this.setGridRowDataWithDelay(addresses);
    });
    this.setColumnDefs();
  }

  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected fetchData(_params: IServerSideGetRowsParamsExtended): void {}

  protected onRowDoubleClicked({ data: row }): void {
    if (!row) {
      return;
    }

    this.onEditAddressHandler(row);
  }

  private onEditAddressActionClicked({ data: row }): void {
    this.onEditAddressHandler(row, true);
  }

  public ngOnDestroy(): void {
    this.store.dispatch(sharedActions.addressesListActions.UpdateAddressesListActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }

  onGridReady(gridApi: GridApi) {
    super.gridReady(gridApi);

    this.store.dispatch(sharedActions.addressesListActions.GetAddressesList({
      searchParams: {
        entityId: this.entityId,
        entityType: this.entityType,
      } as AddressesListSearchParams,
    }));
  }

  private onEditAddressHandler(address: EntityAddress, canEdit: boolean = false): void {
    const { entityId, entityType, entityName } = this;

    this.store.dispatch(sharedActions.addAddressModalActions.OpenAddressModal({
      entityId,
      entityTypeId: entityType,
      entityName,
      address,
      canEdit,
      canRunMoveCheck: entityType === EntityTypeEnum.Clients || entityType === EntityTypeEnum.Persons,
      showAddresseeAndAttnTo: this.showAddresseeAndAttnTo,
    }));
  }

  private onSetPrimaryAddressHandler(e): void {
    this.store.dispatch(sharedActions.addressesListActions.SetPrimaryAddress({ addressId: e.node.data.id }));
  }

  public addNewRecord(): void {
    this.addAddress();
  }

  private addAddress(): void {
    let isPrimaryAddress: boolean;
    this.addresses$.pipe(
      first(),
    ).subscribe(addresses => { isPrimaryAddress = !addresses || addresses.length === 0; });
    this.store.dispatch(sharedActions.addAddressModalActions.OpenAddressModal({
      entityName: this.entityName,
      entityId: this.entityId,
      entityTypeId: this.entityType,
      canEdit: true,
      canRunMoveCheck: this.entityType === EntityTypeEnum.Clients || this.entityType === EntityTypeEnum.Persons,
      isPrimaryAddress,
      showAddresseeAndAttnTo: this.showAddresseeAndAttnTo
    }));
  }
}
