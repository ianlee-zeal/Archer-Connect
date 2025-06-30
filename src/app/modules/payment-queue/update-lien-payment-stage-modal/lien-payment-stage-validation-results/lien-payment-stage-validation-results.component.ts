import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import * as fromShared from '@app/modules/shared/state';
import { GridApi, GridOptions } from 'ag-grid-community';
import { GridId } from '@app/models/enums/grid-id.enum';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Subject } from 'rxjs';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Store } from '@ngrx/store';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { Router } from '@angular/router';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { first } from 'rxjs/operators';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as paymentQueueSelectors from '../../../projects/project-disbursement-payment-queue/state/selectors';
import * as globalPaymentQueueActions from '../../state/actions';

@Component({
  selector: 'app-lien-payment-stage-validation-results',
  templateUrl: './lien-payment-stage-validation-results.component.html',
})
export class LienPaymentStageValidationResultsComponent extends ListView implements OnDestroy, OnInit {
  @Input() public batchActionId: number;
  @Input() public stageId: number;

  public readonly stages$ = this.store.select(paymentQueueSelectors.activeLienPaymentStages);
  public readonly gridId: GridId = GridId.LienPaymentStageValidationResults;
  protected gridApi: GridApi;
  public stageName: string;

  private readonly MAX_ROWS_NUMBER = 8;

  protected ngUnsubscribe$ = new Subject<void>();

  public enabledAutoHeight: boolean = false;
  public skipSetContentHeight: boolean = true;
  public isContentAutoHeight: boolean = true;

  get isMaxRowsNumber(): boolean {
    return this.gridApi?.getDisplayedRowCount() > this.MAX_ROWS_NUMBER;
  }

  get rowHeight(): string {
    const headerHeight = 50;
    return `${this.MAX_ROWS_NUMBER * AGGridHelper.defaultGridOptions.rowHeight + headerHeight}px`;
  }

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Ledger Entry ID',
        field: 'fields.LedgerEntryId',
        width: 100,
      },
      { headerName: 'Summary', field: 'summary', width: 120 },
      {
        headerName: 'Description',
        field: 'errorList',
        cellRenderer: data => {
          if (data.data.errorList) {
            return data.data.errorList?.map((s: any) => s.summary).join('<br>');
          }
          return `Lien Payment Stage updated to ${this.stageName}`;
        },
      },
    ],
  };

  public ngOnInit(): void {
    this.stages$.pipe(first())
      .subscribe((params: SelectOption[]) => {
        this.stageName = params?.find(p => p.id === this.stageId)?.name;
      });
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(globalPaymentQueueActions.GetBatchActionLienPaymentStageValidationResult({
      batchActionId: this.batchActionId,
      documentTypeId: BatchActionDocumentType.PreviewValidation,
      agGridParams,
    }));
  }

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnDestroy(): void {
    this.store.dispatch(globalPaymentQueueActions.ResetGetBatchActionLienPaymentStageValidationResult());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
