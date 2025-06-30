import { Component, ElementRef, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  CellValueChangedEvent,
  EditableCallbackParams,
  GridApi,
  GridOptions,
  RedrawRowsParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { PermissionService } from '@app/services';
import {
  PermissionActionTypeEnum,
  PermissionTypeEnum,
  ProductCategory,
} from '@app/models/enums';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as commonActions from '@app/modules/projects/state/actions';
import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Dictionary } from '@app/models/utils';
import { Project } from '@app/models';
import { ProjectsCommonState } from '../../state/reducer';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';
import { SeverityStatusRendererComponent } from '../project-deficiencies-details/severity-status-renderer/severity-status-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-project-deficiencies-config',
  templateUrl: './project-deficiencies-config.component.html',
  styleUrls: ['./project-deficiencies-config.component.scss'],
})
export class ProjectDeficienciesConfigOldComponent
  extends ListView
  implements OnInit, OnDestroy {
  readonly gridId = GridId.ProjectDeficienciesConfig;

  readonly project$ = this.store.select(selectors.item);
  private readonly deficiencySettings$ = this.store.select(
    selectors.deficiencySettings,
  );

  private readonly deficiencySettingsSavedSuccessfully$ = this.store.select(selectors.deficiencySettingsSavedSuccessfully);

  private updatedData = new Dictionary<number, DeficiencySettingsConfig>();
  public deficiencySettings: DeficiencySettingsConfig[];
  private projectId: number;
  public form: UntypedFormGroup;

  private readonly colEnabled = 'active';

  public readonly deficiencyCategories = [
    ProductCategory.MedicalLiens,
    ProductCategory.Bankruptcy,
    ProductCategory.Release,
    ProductCategory.Probate,
    ProductCategory.QSFAdministration,
  ];

  private readonly actionBar: ActionHandlersMap = {
    edit: {
      callback: () => this.startEditing(),
      hidden: () => this.editEnabled,
      permissions: PermissionService.create(
        PermissionTypeEnum.ProjectQsfDeficiencies,
        PermissionActionTypeEnum.DeficiencyConfiguration,
      ),
    },
    save: {
      callback: () => this.onSave(),
      hidden: () => !this.editEnabled,
      awaitedActionTypes: [
        actions.SaveDeficiencySettingsSuccess.type,
        actions.Error.type,
      ],
    },
    cancel: {
      callback: () => this.stopEditing(true),
      hidden: () => !this.editEnabled,
    },
    clearFilter: this.clearFilterAction(),
  };

  readonly gridOptions: GridOptions = {
    getRowId: (props: any) => `${props.data.id}_${props.data.isRelatedProcess}`,
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Category',
        field: 'category',
        valueGetter: (params: ValueGetterParams): string | null => (!params.data.isRelatedProcess ? params.data.category : null),
        maxWidth: 150,
        minWidth: 130,
      },
      {
        headerName: 'Deficiency',
        field: 'deficiencyType.name',
        valueGetter: (params: ValueGetterParams): string | null => (!params.data.isRelatedProcess ? params.data.deficiencyType.name : null),
        minWidth: 460,
      },
      {
        headerName: 'Active',
        field: 'active',
        cellRenderer: 'checkBoxRenderer',
        editable: (params: EditableCallbackParams): boolean => this.editEnabled && params.data.isRelatedProcess,
        ...AGGridHelper.tagColumnDefaultParams,
        width: 60,
        minWidth: 60,
        valueGetter: (params: ValueGetterParams): boolean | null => (params.data.isRelatedProcess ? params.data.active : null),
      },
      {
        headerName: 'Related Process',
        field: 'deficiencyTypeProcess.name',
        valueGetter: (params: ValueGetterParams): string | null => (params.data.isRelatedProcess ? params.data.deficiencyTypeProcess.name : null),
        minWidth: 300,
      },
      {
        headerName: 'Severity',
        cellRenderer: 'severityStatusRenerer',
        minWidth: 200,
      },
      {
        headerName: 'Deficiency Level',
        field: 'deficiencyType.entityType.name',
        valueGetter: (params: ValueGetterParams): string | null => (!params.data.isRelatedProcess ? params.data.deficiencyType.entityType.name : null),
        minWidth: 250,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    components: {
      checkBoxRenderer: CheckboxEditorRendererComponent,
      severityStatusRenerer: SeverityStatusRendererComponent,
    },
    onCellValueChanged: this.onCellValueChanged.bind(this),
    suppressClickEdit: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    pagination: false,
    suppressScrollOnNewData: true,
    getRowClass: (params: any) => {
      if (!(params.data as DeficiencySettingsConfig).isRelatedProcess) {
        return 'ag-row-odd-dark ag-row-border-bottom-dark';
      }
      return 'ag-row-white';
    },
  };

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    router: Router,
    elementRef: ElementRef,
    private readonly fb: UntypedFormBuilder,
    private readonly cd: ChangeDetectorRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.store.dispatch(
      commonActions.UpdateActionBar({ actionBar: this.actionBar }),
    );
    this.project$
      .pipe(
        filter((item: Project) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(({ id }: { id: number }) => {
        this.projectId = id;
        this.updatedData.clear();
        this.store.dispatch(
          actions.GetDeficiencySettingsList({ projectId: this.projectId }),
        );
      });

    this.deficiencySettings$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((items: DeficiencySettingsConfig[]) => {
        this.deficiencySettings = items;
        if (this.deficiencySettings) {
          this.form = this.getForm();
          this.cd.markForCheck();
        }
      });

    this.deficiencySettingsSavedSuccessfully$.pipe(
      filter((deficiencySettingsSavedSuccessfully: boolean) => !!deficiencySettingsSavedSuccessfully),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => this.stopEditing());
  }

  ngOnDestroy(): void {
    this.store.dispatch(commonActions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }

  onGridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
    this.deficiencySettings$
      .pipe(
        filter((items: DeficiencySettingsConfig[]) => !!items),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((items: DeficiencySettingsConfig[]) => {
        this.gridApi.setGridOption('rowData', items);
        this.applySavedGridSettings();
      });
  }

  onChange(categoryId: number, checked: boolean): void {
    this.deficiencySettings.filter((i: DeficiencySettingsConfig) => i.productCategoryId === categoryId && i.isRelatedProcess).forEach((item: DeficiencySettingsConfig) => {
      const node = this.gridApi.getRowNode(`${item.id}_${item.isRelatedProcess}`);
      const newItem = { ...node.data, active: checked };
      node.setData(newItem);
      this.updatedData.setValue(item.id, newItem);
    });
  }

  protected stopEditing(withReload = false): void {
    super.stopEditing();
    this.updatedData.clear();
    this.deficiencyCategories.forEach((item: ProductCategory) => {
      this.form.get(`category_${item}`).disable();
    });
    if (withReload) {
      this.store.dispatch(actions.GetDeficiencySettingsList({ projectId: this.projectId }));
    }
  }

  protected startEditing(): void {
    super.startEditing();
    this.deficiencyCategories.forEach((item: ProductCategory) => {
      if (!this.isDisabledCategoryEnablement(item)) {
        this.form.get(`category_${item}`).enable();
      }
    });
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  private isDisabledCategoryEnablement(category): boolean {
    return !this.editEnabled || category === ProductCategory.QSFAdministration;
  }

  private onSave(): void {
    if (this.updatedData.count() > 0) {
      this.store.dispatch(actions.SaveDeficiencySettings({ projectId: this.projectId, data: this.updatedData.values() }));
    } else {
      this.stopEditing();
    }
  }

  private getActiveForCategory(categoryId: number): boolean {
    return this.deficiencySettings
      .filter((i: DeficiencySettingsConfig) => i.productCategoryId === categoryId)
      .every((i: DeficiencySettingsConfig) => i.active);
  }

  private getForm(): UntypedFormGroup {
    const form = {};
    this.deficiencyCategories.forEach((item: ProductCategory) => {
      form[`category_${item}`] = [{
        value: this.getActiveForCategory(item),
        disabled: this.isDisabledCategoryEnablement(item),
      }];
    });
    return this.fb.group(form);
  }

  private onCellValueChanged(event: CellValueChangedEvent): void {
    const rowData = event.data as DeficiencySettingsConfig;
    const colId = event.column.getColId();
    const isCheckbox = typeof rowData[colId] === 'boolean';
    if (isCheckbox) {
      if (colId === this.colEnabled) {
        this.gridApi.redrawRows(<RedrawRowsParams>{ rowNodes: [event.node] });
      }
    }
    this.updatedData.setValue(rowData.id, rowData);

    this.form.get(`category_${rowData.productCategoryId}`).setValue(this.getActiveForCategory(rowData.productCategoryId));
  }
}
