import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AGGridHelper } from '@app/helpers';
import { GridId } from '@app/models/enums';
import { GridOptions } from 'ag-grid-community';
import { RemoveButtonCellRendererComponent } from '../renderers/remove-button-renderer.component';

@Component({
  selector: 'app-document-batch-files',
  templateUrl: './document-batch-files.component.html',
  styleUrls: ['./document-batch-files.component.scss']
})
export class DocumentBatchFilesComponent implements OnInit {

  @Input() public selectedFiles: File[];
  @Output() fileRemoved = new EventEmitter<File>();

  public selectedFilesGrid: GridId = GridId.DocumentBatchFiles;
  public selectedFilesGridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    columnDefs: [
      {
        headerName: 'File Name',
        field: 'name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        width: 100,
      },
      {
        headerName: 'Size',
        field: 'size',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        width: 100,
        valueFormatter: params => this.sizeFormatter(params.value),
      },
      AGGridHelper.getActionsColumn({ removeHandler: this.remove.bind(this) }, 80, true),
    ],
    components: {
      buttonRenderer: RemoveButtonCellRendererComponent,
    },
  };

  constructor() { }

  ngOnInit(): void {
  }

  remove(file): void {
    this.fileRemoved.emit(file.data);
  }

  sizeFormatter(params: number): string {
    const size = params;
    if (size < 1024) {
      return size + ' bytes';
    } else if (size >= 1024 && size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else if (size >= 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(2) + ' MB';
    }
  }

}