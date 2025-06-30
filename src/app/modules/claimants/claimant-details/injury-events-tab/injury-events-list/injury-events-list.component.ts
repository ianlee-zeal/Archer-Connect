import { Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ModalService } from '@app/services';
import { InjuryEvent } from '@app/models/injury-event';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { GridId } from '@app/models/enums/grid-id.enum';
import { UpdateClaimantsActionBar } from '../../state/actions';
import { IInjuryEventsListState } from '../state/reducer';
import { GetInjuryEventsList } from '../state/actions';
import { AddNewInjuryEventModalComponent } from '../add-new-injury-event-modal/add-new-injury-event-modal.component';
import { GotoParentView } from '../../../../shared/state/common.actions';

@Component({
  selector: 'app-injury-events-list',
  templateUrl: './injury-events-list.component.html',
  styleUrls: ['./injury-events-list.component.scss'],
})
export class InjuryEventsListComponent extends ListView implements OnDestroy {
  @Input() public entityId: number;

  public readonly gridId: GridId = GridId.InjuryEvents;

  private readonly actionBar: ActionHandlersMap = {
    new: () => this.onAddClicked(),
    back: () => this.onBackClicked(),
  };

  public ngDestroyed$ = new Subject<void>();
  public bsModalRef: BsModalRef;

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Date',
        field: 'startDate',
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        sortable: true,
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Type',
        field: 'injuryEventType.name',
        width: 200,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Description',
        field: 'description',
        width: 200,
        sortable: true,
        resizable: true,
      },
    ],
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private store: Store<IInjuryEventsListState>,
    private modalService: ModalService,
    private datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(GetInjuryEventsList({ claimantId: this.entityId, params }));
  }

  public ngOnInit(): void {
    this.store.dispatch(UpdateClaimantsActionBar({ actionBar: this.actionBar }));
  }

  private onRowDoubleClicked(row): void {
    this.bsModalRef = this.modalService.show(AddNewInjuryEventModalComponent, {
      class: 'injury-events-modal',
      initialState: {
        claimantId: this.entityId,
        injuryEvent: new InjuryEvent({
          id: row.data.id,
          injuryEventType: row.data.injuryEventType,
          startDate: row.data.startDate,
          description: row.data.description,
        }),
      },
    });
  }

  public addNewRecord(): void {
    this.onAddClicked();
  }

  private onAddClicked(): void {
    this.bsModalRef = this.modalService.show(AddNewInjuryEventModalComponent, {
      class: 'injury-events-modal',
      initialState: { claimantId: this.entityId },
    });
  }

  private onBackClicked(): void {
    this.store.dispatch(GotoParentView());
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
