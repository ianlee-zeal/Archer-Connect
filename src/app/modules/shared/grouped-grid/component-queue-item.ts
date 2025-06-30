import { ComponentFactory, ViewContainerRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

export interface ComponentQueueItem {
  componentFactory: ComponentFactory<ICellRendererAngularComp>;
  container: ViewContainerRef;
  row: any;
  colDef: ColDef;
}
