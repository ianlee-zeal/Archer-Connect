import { Component, ElementRef } from '@angular/core';
import { AGGridHelper } from '@app/helpers';
import { GridId, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PrimaryTagRendererComponent, ValueWithTooltipRendererComponent } from '@app/modules/shared/_renderers';
import { GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import * as projectActions from '@app/modules/projects/state/actions';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { PermissionService } from '@app/services';
import { IdValue } from '@app/models';
import { actions } from './state';
import { DeficiencySettingsTemplatesState } from './state/reducers';
import { DeficiencySettingsTemplateService } from '../services/deficiency-settings-template.service';
import { TemplateActionEnum } from '../enums/template-actions.enum';
import { ProjectDeficienciesActionsRendererComponent } from './project-deficiencies-actions-renderer/project-deficiencies-actions-renderer.component';

@Component({
  selector: 'app-project-deficiencies-grid',
  templateUrl: './project-deficiencies-grid.component.html',
})
export class ProjectDeficienciesGridComponent extends ListView {
  public gridId: GridId = GridId.ProjectDeficienciesSettingsTemplates;
  public readonly projectItem$ = this.store.select(projectSelectors.item);

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Project Default',
        field: 'isDefault',
        cellRenderer: 'primaryRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 120,
      },
      {
        headerName: 'Name',
        field: 'templateName',
        valueGetter: ({ data }: { data: DeficiencySettingsTemplate }): string => (!data.isSystemDefault ? `${data.templateName} - ${data.projectId}` : data.templateName),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Type',
        field: 'type',
      },
      {
        headerName: 'Disbursement Groups In Use',
        field: 'disbursmentGroups',
        valueGetter: ({ data }: { data: DeficiencySettingsTemplate }): string => data.disbursmentGroups.map((i: IdValue) => i.id).join(', '),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 200,
        cellRenderer: 'valueWithTooltip',
        tooltipValueGetter: ():string => null,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        ...AGGridHelper.nameColumnDefaultParams,
      },

      AGGridHelper.getActionsColumn({
        editHandler: this.editHandler.bind(this),
        setAsPrimary: this.setAsPrimary.bind(this),
        copyHandler: this.copyHandler.bind(this),
      }),
    ],
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: false,
    },
    components: {
      buttonRenderer: ProjectDeficienciesActionsRendererComponent,
      primaryRenderer: PrimaryTagRendererComponent,
      valueWithTooltip: ValueWithTooltipRendererComponent,
    },
  };

  constructor(
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private readonly store: Store<DeficiencySettingsTemplatesState>,
    private readonly datePipe: DateFormatPipe,
    private readonly templateService: DeficiencySettingsTemplateService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.store.dispatch(projectActions.UpdateActionBar({
      actionBar: {
        new: {
          callback: () => this.addNewRecord(),
          permissions: [
            PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.DeficiencyConfiguration),
            PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read),
          ],
        },
      },
    }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(actions.GetDeficienciesTemplatesList({ params }));
  }

  public addNewRecord(): void {
    this.store.dispatch(actions.CreateTemplate());
  }

  private editHandler({ data: row }: { data: DeficiencySettingsTemplate }): void {
    if (this.templateService.canEditTemplate(row)) {
      this.templateService.openTemplate(true, TemplateActionEnum.Edit, row.id);
    }
  }

  private setAsPrimary({ data: row } : { data: DeficiencySettingsTemplate }): void {
    if (this.templateService.canSetDefaultTemplate(row)) {
      this.store.dispatch(actions.SetDefaultTemplate({ templateId: row.id }));
    }
  }

  private copyHandler({ data: row }: { data: DeficiencySettingsTemplate }): void {
    this.templateService.openTemplate(true, TemplateActionEnum.Copy, row.id);
  }

  private onRowDoubleClicked({ data: row }: { data: DeficiencySettingsTemplate }): void {
    this.templateService.openTemplate(false, TemplateActionEnum.Read, row.id);
  }
}
