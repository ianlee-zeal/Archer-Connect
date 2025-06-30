import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { ListView } from '../_abstractions/list-view';
import { DateFormatPipe } from '../_pipes';
import * as fromShared from '../state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const { sharedActions } = fromShared;

@Component({
  selector: 'app-stage-history-modal',
  templateUrl: './stage-history-modal.component.html',
  styleUrls: ['./stage-history-modal.component.scss'],
})
export class StageHistoryModalComponent extends ListView {
  @Input() id: number;

  public gridId: GridId = GridId.StageHistory;

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Date Modified',
        field: 'dateModified',
        cellRenderer: data => (data ? this.datePipe.transform(data.value) : null),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Modified By',
        field: 'modifiedBy',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Update By Process',
        field: 'updatedByProcess',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'New Stage',
        field: 'newStage',
        ...AGGridHelper.nameColumnDefaultParams,
      },
    ],
  };

  constructor(
    protected router: Router,
    protected elementRef: ElementRef,
    private readonly datePipe: DateFormatPipe,
    public modal: BsModalRef,
    private store: Store<fromShared.AppState>,
  ) { super(router, elementRef); }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    this.store.dispatch(sharedActions.stageHistoryActions.GetStageHistoryList({ id: this.id, agGridParams }));
  }

  public onClose(): void {
    this.modal.hide();
  }
}
