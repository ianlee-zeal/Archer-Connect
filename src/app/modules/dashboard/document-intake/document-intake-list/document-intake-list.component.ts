import { Component, OnInit, ElementRef, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '../../../shared/state';
import { actions } from '../state';
import { DocumentIntakeRendererComponent } from '../renderers/document-intake-buttons-renderer';

@Component({
  selector: 'app-document-intake-list',
  templateUrl: './document-intake-list.component.html',
  styleUrls: ['./document-intake-list.component.scss'],
})
export class DocumentIntakeListComponent extends ListView implements OnInit, OnDestroy {
  @Input() public gridId: GridId;

  private readonly actionBar: ActionHandlersMap = { clearFilter: this.clearFilterAction() };

  public gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Type',
        field: 'type',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'Project',
        field: 'projectName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Count',
        field: 'count',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.numberColumnDefaultParams,
      },
      AGGridHelper.getActionsColumn({ viewDocumentIntakeHandler: this.viewDocumentIntake.bind(this) }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    components: { buttonRenderer: DocumentIntakeRendererComponent },
  };

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(actions.GetDocumentIntakeListRequest({ agGridParams }));
  }

  constructor(
    public store: Store<AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  public viewDocumentIntake(projectId: number): void {
    this.router.navigate([`/projects/${projectId}/payments/tabs/election-forms`]);
  }

  protected onRowDoubleClicked(row): void {
    this.viewDocumentIntake(row.data.projectId);
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
