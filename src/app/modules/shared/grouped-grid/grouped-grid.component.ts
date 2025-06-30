import { Component, Input, AfterViewInit, ComponentFactoryResolver, ViewChildren, QueryList, ViewContainerRef, SimpleChanges } from '@angular/core';
import { GridOptions, ColDef, ICellRendererFunc } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { CommonHelper } from '@app/helpers/common.helper';
import { ArrayHelper } from '@app/helpers/array.helper';
import { StringHelper } from '@app/helpers/string.helper';
import { ComponentQueueItem } from './component-queue-item';

@Component({
  selector: 'app-grouped-grid',
  templateUrl: './grouped-grid.component.html',
  styleUrls: ['./grouped-grid.component.scss'],
})
export class GroupedGridComponent implements AfterViewInit {
  @ViewChildren('groupRenderer', { read: ViewContainerRef }) public groupRenderers: QueryList<ViewContainerRef>;
  @ViewChildren('renderer', { read: ViewContainerRef }) public rendereres: QueryList<ViewContainerRef>;

  @Input() public gridOptions: GridOptions;
  @Input() public rowData: any;
  @Input() public sortMethod: (rowData: any) => any | undefined;

  public options: GridOptions;
  public data: any[];

  private componentQueue: ComponentQueueItem[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
  ) { }

  public ngAfterViewInit(): void {
    const rows = this.data;
    let childRowNumber = 0;

    rows.forEach((row, rowIndex) => {
      const getGroupColDef = this.getGroupColDef();

      if (getGroupColDef.cellRenderer) {
        this.createCellRenderer(row, getGroupColDef, rowIndex, 0, this.groupRenderers, 1);
      }

      if (row.children) {
        row.children.forEach(childRow => {
          this.createCellRenderers(childRow, childRowNumber++);
        });
      }
    });

    this.createComponents();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { rowData } = this;
    const rowDataChange = changes[CommonHelper.nameOf({ rowData })];

    if (rowDataChange) {
      this.calculateData(rowDataChange.currentValue as any[]);
    }
  }

  public cellRenderer(row, colDef: ColDef) {
    if (!colDef.cellRenderer) {
      return colDef.field ? row[colDef.field] : row;
    }

    const cellRenderer = colDef.cellRenderer as ICellRendererFunc;

    return row[colDef.field] ? cellRenderer(row[colDef.field]) : '';
  }

  public isCellRendererComponent(cellRenderer): boolean {
    return cellRenderer && StringHelper.isString(cellRenderer);
  }

  private calculateData(rows: any[]): void {
    const groupedCols = (this.gridOptions.columnDefs).filter((colDef: ColDef) => colDef.rowGroup);

    if (groupedCols.length > 1) {
      throw new Error('More than one col grouping is not supported yet');
    }

    if (!groupedCols.length) {
      this.data = rows;
    } else {
      let data = [];

      groupedCols.forEach((groupedCol: ColDef) => {
        const grouped = ArrayHelper.groupBy(rows, groupedCol.field, this.groupFieldIdGetter);

        data = data.concat(Object.keys(grouped).map(key => {
          const foundRow = rows.find(row => this.groupFieldIdGetter(row[groupedCol.field]) == key);
          const groupedFieldValue = foundRow[groupedCol.field];

          return {
            ...groupedFieldValue,
            children: grouped[key],
          };
        }));
      });

      this.data = data;
    }

    if (this.sortMethod) {
      this.data = this.sortMethod(this.data);
    }
  }

  private createCellRenderers(row: object, rowIndex: number): void {
    if (!this.rendereres.length) {
      return;
    }

    this.gridOptions.columnDefs
      .filter((colDef: ColDef) => !colDef.rowGroup && this.isCellRendererComponent(colDef.cellRenderer))
      .forEach((colDef: ColDef, index: number, array) => {
        this.createCellRenderer(row, colDef, rowIndex, index, this.rendereres, array.length);
      });
  }

  private createCellRenderer(row: any, colDef: ColDef, rowIndex: number, colIndex: number, colRenderersRefs: QueryList<ViewContainerRef>, renderersInRow: number): void {
    const renderer = this.gridOptions.components[colDef.cellRenderer as string];

    if (!renderer) {
      throw new Error(`cellRenderer for column '${colDef.field}' is not found in gridOptions.components`);
    }

    const columnContainer = colRenderersRefs.find((_item, index) => index === (rowIndex * renderersInRow + colIndex));
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory<ICellRendererAngularComp>(renderer);

    this.componentQueue.push({
      componentFactory,
      container: columnContainer,
      row,
      colDef,
    } as ComponentQueueItem);
  }

  private createComponents(): void {
    // we should use pseudo-async operation here in order to avoid angular errors because angular doesn't allow to create child components after parents rendered
    window.setTimeout(() => {
      this.componentQueue.forEach(componentItem => {
        const component = componentItem.container.createComponent<ICellRendererAngularComp>(componentItem.componentFactory, 0);
        const { row, colDef } = componentItem;

        component.instance.agInit({ value: row[colDef.field] || row, ...colDef.cellRendererParams });
      });
    }, 0);
  }

  private getGroupColDef(): ColDef {
    return this.gridOptions.columnDefs.find((colDef: ColDef) => colDef.rowGroup);
  }

  private groupFieldIdGetter(obj): string | number {
    return obj.id;
  }
}
