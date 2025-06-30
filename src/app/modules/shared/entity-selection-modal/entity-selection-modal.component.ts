import { Component, ElementRef } from '@angular/core';

import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions, RowClickedEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as rootActions from '@app/state/root.actions';
import { ModalService } from '@app/services';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-entity-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class EntitySelectionModalComponent extends ListView {
  public title: string;
  public gridId: GridId;
  public gridOptions: GridOptions;
  public entityLabel: string;
  public gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => void;
  public onEntitySelected: (entity: any) => void;

  public selectedEntity: any;
  public selectedEntities: any[] = [];

  public get isSaveDisabled(): boolean {
    const haveSelectedEntities: boolean = this.selectedEntities && this.selectedEntities.some((item: any) => item.selected);
    return !this.selectedEntity && !haveSelectedEntities;
  }

  constructor(
    public store: Store<any>,
    public modal: ModalService,
    router: Router,
    elemRef: ElementRef<any>,
    public modalRef: BsModalRef,
  ) {
    super(router, elemRef);
  }

  ngOnInit(): void {
    if (!this.gridOptions) {
      return;
    }

    this.gridOptions.onRowClicked = (e: RowClickedEvent): void => {
      this.selectedEntity = e.data;
    };

    this.gridOptions.onRowDoubleClicked = (e: RowDoubleClickedEvent): void => {
      this.selectedEntity = e.data;
      this.onSave();
    };
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridDataFetcher(params);
  }

  public onSave(): void {
    this.onEntitySelected(this.selectedEntity);
    this.modalRef.hide();
  }

  public ngOnDestroy(): void {
    if (!this.gridId) {
      return;
    }
    this.store.dispatch(rootActions.ClearGridLocalData({ gridId: this.gridId }));
    super.ngOnDestroy();
  }
}
