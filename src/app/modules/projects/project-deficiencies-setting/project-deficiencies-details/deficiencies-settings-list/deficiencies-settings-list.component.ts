import { Component, ElementRef, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import {
  CellRendererSelectorResult,
  CellValueChangedEvent,
  EditableCallbackParams,
  GridApi,
  GridOptions,
  ICellRendererParams,
  RedrawRowsParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import {
  ProductCategory,
} from '@app/models/enums';

import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { Project } from '@app/models';
import { ITextWithIconRendererParams, TextWithIconRendererComponent } from '@app/modules/shared/_renderers';
import * as projectSelectors from '../../../state/selectors';
import { SeverityStatusRendererComponent } from '../severity-status-renderer/severity-status-renderer.component';
import { selectors, actions } from '../state';
import { DeficienciesTemplateDetailsState } from '../state/reducers';
import { DeficiencyTypeSource, DeficiencyTypeSourceNames } from '../../enums/deficiency-type-source.enum';
import { HiddenTextRendererComponent, IHiddenTextRendererParams } from '../../renderers/hidden-text-renderer/hidden-text-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-project-deficiencies-settings-list',
  templateUrl: './deficiencies-settings-list.component.html',
  styleUrls: ['./deficiencies-settings-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDeficienciesSettingsListComponent
  extends ListView
  implements OnInit, OnDestroy {
  readonly gridId = GridId.ProjectDeficienciesConfig;

  readonly project$ = this.store.select(projectSelectors.item);
  readonly deficiencyTemplate$ = this.store.select(
    selectors.deficiencyTemplate,
  );
  private readonly canEdit$ = this.store.select(selectors.canEdit);

  public deficiencySettings: DeficiencySettingsConfig[];
  public form: UntypedFormGroup;

  private readonly colEnabled = 'active';

  public readonly deficiencyCategories = [
    ProductCategory.MedicalLiens,
    ProductCategory.Bankruptcy,
    ProductCategory.Release,
    ProductCategory.Probate,
    ProductCategory.QSFAdministration,
  ];

  readonly gridOptions: GridOptions = {
    getRowId: (props: any) => `${props.data.id}_${props.data.isRelatedProcess}`,
    animateRows: false,
    defaultColDef: {
      floatingFilter: true,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'ID',
        field: 'deficiencyType.id',
        width: 50,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => this.hiddenTextRenderer({
          value: params.data.deficiencyType.id,
          isHidden: params.data.isRelatedProcess,
        }),
      },
      {
        headerName: 'Category',
        field: 'category',
        ...AGGridHelper.getCustomTextColumnFilter(),
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => this.hiddenTextRenderer({
          value: params.data.category,
          isHidden: params.data.isRelatedProcess,
        }),
        maxWidth: 150,
        minWidth: 130,
      },
      {
        headerName: 'Deficiency',
        field: 'deficiencyType.name',
        ...AGGridHelper.getCustomTextColumnFilter(),
        cellRendererSelector: this.deficiencyNameRenderer.bind(this),
        minWidth: 460,
      },
      {
        headerName: 'Active',
        field: 'active',
        cellRenderer: 'checkBoxRenderer',
        editable: (params: EditableCallbackParams): boolean => this.editEnabled && params.data.isRelatedProcess && params.data.isActiveChangeable,
        ...AGGridHelper.tagColumnDefaultParams,
        width: 60,
        minWidth: 60,
        valueGetter: (params: ValueGetterParams): string => (params.data.isRelatedProcess ? params.data.active : null),
      },
      {
        headerName: 'Related Process',
        field: 'deficiencyTypeProcess.name',
        valueGetter: (params: ValueGetterParams): string => (params.data.isRelatedProcess ? params.data.deficiencyTypeProcess.name : null),
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
        valueGetter: (params: ValueGetterParams) : string => (!params.data.isRelatedProcess ? params.data.deficiencyType.entityType.name : null),
        minWidth: 250,
      },
      {
        headerName: 'Origin',
        field: 'deficiencyType.deficiencyTypeSourceId',
        valueGetter: this.getDeficiencyTypeSourceName.bind(this),
        width: 100,
        minWidth: 100,
      },
    ],
    components: {
      checkBoxRenderer: CheckboxEditorRendererComponent,
      severityStatusRenerer: SeverityStatusRendererComponent,
      textWithIconRenderer: TextWithIconRendererComponent,
      hiddenTextRenderer: HiddenTextRendererComponent,
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
    private readonly store: Store<DeficienciesTemplateDetailsState>,
    router: Router,
    elementRef: ElementRef,
    private readonly fb: UntypedFormBuilder,
  ) {
    super(router, elementRef);
  }

  private getDeficiencyTypeSourceName(params: ValueGetterParams): string {
    let deficiencyTypeSourceName: string = null;
    if (params.data.deficiencyType.deficiencyTypeSourceId) {
      const deficiencyTypeSourceId = params.data.deficiencyType.deficiencyTypeSourceId as DeficiencyTypeSource;
      deficiencyTypeSourceName = deficiencyTypeSourceId === DeficiencyTypeSource.LSR
        ? DeficiencyTypeSourceNames[deficiencyTypeSourceId]
        : 'Connect';
    }
    return !params.data.isRelatedProcess ? deficiencyTypeSourceName : null;
  }

  ngOnInit(): void {
    this.project$
      .pipe(
        filter((item: Project) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        this.store.dispatch(actions.ClearUpdatedSettingItems());
      });

    this.deficiencyTemplate$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter((item: DeficiencySettingsTemplate) => item != null),
        withLatestFrom(this.canEdit$),
      )
      .subscribe(([template, canEdit] : [DeficiencySettingsTemplate, boolean]) => {
        this.deficiencySettings = template.deficiencyTypeSettings;
        if (this.deficiencySettings) {
          this.form = this.getForm();
          if (canEdit) {
            this.startEditing();
          }
        }
      });

    this.canEdit$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((canEdit: boolean) => {
        if (canEdit) {
          this.startEditing();
        } else {
          this.stopEditing();
        }
      });
  }

  onGridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
    this.deficiencyTemplate$
      .pipe(
        filter((item: DeficiencySettingsTemplate) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((template: DeficiencySettingsTemplate) => {
        this.gridApi.setGridOption('rowData', template.deficiencyTypeSettings);
        this.applySavedGridSettings();
      });
  }

  onChange(categoryId: number, checked: boolean): void {
    this.deficiencySettings
      .filter((i: DeficiencySettingsConfig) => i.productCategoryId === categoryId && i.isRelatedProcess)
      .forEach((item: DeficiencySettingsConfig) => {
        const node = this.gridApi.getRowNode(`${item.id}_${item.isRelatedProcess}`);
        const newItem = { ...node.data, active: checked };
        node.setData(newItem);
        this.store.dispatch(actions.SetUpdatedSettingItems({ settingId: item.id, setting: newItem }));
      });
  }

  public stopEditing(): void {
    super.stopEditing();
    this.store.dispatch(actions.ClearUpdatedSettingItems());
    if (this.form) {
      this.deficiencyCategories.forEach((item: ProductCategory) => {
        this.form.get(`category_${item}`).disable();
      });
    }
  }

  public startEditing(): void {
    super.startEditing();
    if (this.form) {
      this.deficiencyCategories.forEach((item: ProductCategory) => {
        if (!this.isDisabledCategoryEnablement(item)) {
          this.form.get(`category_${item}`).enable();
        }
      });
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  private isDisabledCategoryEnablement(category): boolean {
    return !this.editEnabled || category === ProductCategory.QSFAdministration;
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
    this.store.dispatch(actions.SetUpdatedSettingItems({ settingId: rowData.id, setting: rowData }));

    this.form.get(`category_${rowData.productCategoryId}`).setValue(this.getActiveForCategory(rowData.productCategoryId));
  }

  private deficiencyNameRenderer(params: ICellRendererParams): CellRendererSelectorResult {
    if (!params.data.isRelatedProcess) {
      return {
        component: 'textWithIconRenderer',
        params: {
          text: params.data.deficiencyType.name,
          textFirst: true,
          icon: 'assets/svg/info-circle-gray.svg',
          title: params.data.deficiencyType.description,
        } as ITextWithIconRendererParams,
      };
    }
    return {
      component: 'hiddenTextRenderer',
      params: {
        value: params.data.deficiencyType.name,
        isHidden: true,
      },
    };
  }

  private hiddenTextRenderer(params: IHiddenTextRendererParams): CellRendererSelectorResult {
    return {
      component: 'hiddenTextRenderer',
      params,
    };
  }
}
