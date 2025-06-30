import { Component, OnDestroy, OnInit } from '@angular/core';
import { AGGridHelper } from '@app/helpers';
import { GridId } from '@app/models/enums';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import * as documentBatchSelectors from '@app/modules/document-batch/state/selectors';
import { SimplifiedDocuments } from '@app/models/document-batch-get/get-single-batch/simplified-documents';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { FileSizePipe } from '@app/modules/shared/_pipes';
import { DocumentBatchState } from '../../state/reducer';

@Component({
  selector: 'app-document-batch-details-files',
  templateUrl: './document-batch-details-files.component.html',
  styleUrls: ['./document-batch-details-files.component.scss'],
})
export class DocumentBatchDetailsFilesComponent implements OnInit, OnDestroy {
  public readonly batchDetails$ = this.store.select(documentBatchSelectors.getBatchDetails);

  public files: SimplifiedDocuments[];

  public filesGrid: GridId = GridId.DocumentBatchDetailsFiles;
  public filesGridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    columnDefs: [
      {
        headerName: 'Id',
        field: 'id',
        sortable: true,
        sort: 'desc',
        width: 140,
        maxWidth: 140,
        ...AGGridHelper.getCustomTextColumnFilter({}),
      },
      {
        headerName: 'File Name',
        field: 'fileName',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        width: 100,
      },
      {
        headerName: 'Size',
        field: 'sizeInBytes',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        width: 100,
        valueFormatter: params => this.fileSizePipe.transform(params.value),
      },
    ],
  };

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private readonly store: Store<DocumentBatchState>,
    private readonly fileSizePipe: FileSizePipe,
  ) { }

  ngOnInit(): void {
    this.batchDetails$
      .pipe(
        filter(batchDetails => batchDetails != null),
        takeUntil(this.destroy$),
      )
      .subscribe(batchDetails => {
        this.files = batchDetails.documents;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
