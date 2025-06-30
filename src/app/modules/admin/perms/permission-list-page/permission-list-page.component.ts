import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GridApi, GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Subject } from 'rxjs';
import { GridId } from '@app/models/enums/grid-id.enum';
import { AGGridHelper } from '@app/helpers';
import * as fromPermissions from '../state';
import { GetPermissions, UpdateCurrentPermission, CommitCurrentPermission, RemovePermissions, UpdateSearch } from '../state/actions';
import { allPermissions, pending, currentPermission, search } from '../state';
import { dropdownValues } from '../../../../state';
import { Permission } from '../../../../models/permission';
import { checkboxColumn } from '../../../shared/_grid-columns/columns';

@Component({
  selector: 'permission-list-page',
  templateUrl: './permission-list-page.component.html',
  styleUrls: ['./permission-list-page.styles.scss'],
})
export class PermissionListPageComponent implements OnInit, OnDestroy {
  @ViewChild('adminPermissionPopup') adminPermissionPopup: ModalDirective;

  public readonly gridId: GridId = GridId.Permissions;
  protected gridApi: GridApi;

  public ngDestroyed$ = new Subject<void>();

  readonly permissions = this.store.select(allPermissions);

  readonly currentPermission = this.store.select(currentPermission);

  readonly pending = this.store.select(pending);

  public searchValue = this.store.select(search);

  public dropDownValues = this.store.select(dropdownValues);

  readonly searchForm = this.formBuilder.group({
    permissionTypeId: [null],
    entityId: [null],
    search_term: '',
  });

  readonly permissionForm = this.formBuilder.group({
    permissionTypeId: [null, [Validators.required]],
    entityId: [null, [Validators.required]],
    action: ['', [Validators.required, Validators.maxLength(20)]],
    description: ['', [Validators.required, Validators.maxLength(200)]],
  });

  public readonly permissionsGridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      checkboxColumn,
      {
        headerName: 'Type',
        field: 'permissionType.name',
        width: 50,
        sortable: true,
        sort: 'asc',
      },
      {
        headerName: 'Entity',
        field: 'entity.name',
        width: 50,
        sortable: true,
      },
      {
        headerName: 'Action',
        field: 'action',
        width: 50,
        sortable: true,
      },
      {
        headerName: 'Description',
        field: 'description',
        width: 200,
        sortable: true,
      },
    ],
    onRowDoubleClicked: this.edit.bind(this),
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
  };

  public actionBarActionHandlers: ActionHandlersMap = {
    new: () => this.adminPermissionPopup.show(),
    delete: {
      callback: () => this.removeSelectedPermissions(),
      disabled: () => !this.getSelectedRowIds().length,
    },
  };

  constructor(
    private store: Store<fromPermissions.AppState>,
    private formBuilder: UntypedFormBuilder,
  ) {

  }

  ngOnInit(): void {
    this.store.dispatch(GetPermissions());
  }

  public gridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  savePermission(): void {
    if (this.permissionForm.valid) {
      this.store.dispatch(CommitCurrentPermission());
      this.closeEditPermissionPopup();
    }
  }

  closeEditPermissionPopup(): void {
    const emptyPermission: Permission = {
      id: 0,
      permissionTypeId: 0,
      permissionType: null,
      entityId: 0,
      entity: null,
      action: '',
      description: '',
      displayOrder: 0,
    };
    this.store.dispatch(UpdateCurrentPermission({ permission: emptyPermission }));
    this.adminPermissionPopup.hide();
  }

  updateCurrentPermission(): void {
    const permission = this.permissionForm.value as Permission;
    this.store.dispatch(UpdateCurrentPermission({ permission }));
  }

  edit({ data }) {
    const permission = data as Permission;
    this.store.dispatch(UpdateCurrentPermission({ permission }));
    this.adminPermissionPopup.show();
  }

  removeSelectedPermissions() {
    const selectedPermissions = this.getSelectedRowIds();

    if (!selectedPermissions.length) {
      return;
    }

    this.store.dispatch(RemovePermissions({ permissions: selectedPermissions }));
  }

  updateSearchValue() {
    const search = this.searchForm.value;
    this.store.dispatch(UpdateSearch({ search }));
    this.search();
  }

  search() {
    this.store.dispatch(GetPermissions());
  }

  clearSearch() {
    this.searchForm.setValue({
      permissionTypeId: null,
      entityId: null,
      search_term: '',
    });
    this.updateSearchValue();
  }

  public addNewRecord(): void {
    this.adminPermissionPopup.show();
  }

  private getSelectedRowIds(): any[] {
    return (this.gridApi && this.gridApi.getSelectedRows()) || [];
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
