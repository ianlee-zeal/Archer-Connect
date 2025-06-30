import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ModalService } from '@app/services';
import { Store } from '@ngrx/store';
import { ColDef, GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import * as fromShared from '@shared/state';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ColumnExport } from '@app/models';
import { exportsSelectors } from '@shared/state/exports/selectors';
import { takeUntil } from 'rxjs/operators';
import { GetDeficiencySettingsTemplates, GetDisbursementGroupStages, GetDisbursementGroupTypes, ResetDeficiencySettingsTemplates, ResetDisbursementGroupStages, ResetDisbursementGroupTypes } from '../../state/actions';

@Component({
  selector: 'app-disbursement-groups-grid',
  templateUrl: './disbursement-groups-grid.component.html',
  styleUrls: ['./disbursement-groups-grid.component.scss'],
})
export class DisbursementGroupsGridComponent extends ListView implements OnInit, OnDestroy {
  @Input() public entityId: number;
  @Input() public gridOptions: GridOptions;
  @Input() public readonly gridId: GridId;
  @Input() public readonly exportOrderColumns: string[];

  @Output() fetchDataEvent = new EventEmitter<IServerSideGetRowsParamsExtended>();
  @Output() public onActionBarUpdated: EventEmitter<any> = new EventEmitter();
  @Output() public onExportEvent: EventEmitter<any> = new EventEmitter();

  public isExporting = false;
  public bsModalRef: BsModalRef;
  protected ngUnsubscribe$ = new Subject<void>();

  private actionBar: ActionHandlersMap;

  constructor(
    private readonly store: Store<fromShared.AppState>,
    protected readonly router: Router,
    public readonly modalService: ModalService,
    protected readonly elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.actionBarInit();
    this.store.dispatch(GetDisbursementGroupTypes());
    this.store.dispatch(GetDisbursementGroupStages());
    this.store.dispatch(GetDeficiencySettingsTemplates());

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.isExporting = result; });

    this.onUpdated();
  }

  private actionBarInit(): void {
    this.actionBar = { clearFilter: this.clearFilterAction() };

    if (this.exportOrderColumns) {
      this.actionBar = {
        ...this.actionBar,
        download: {
          disabled: () => this.isExporting,
          options: [
            { name: 'Standard', callback: () => this.export(this.getAllColumnDefs()) },
          ],
        },
        exporting: { hidden: () => !this.isExporting },
      };
    }
  }

  public onUpdated(): void {
    this.onActionBarUpdated.emit({ ...this.actionBar });
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    this.fetchDataEvent.emit(agGridParams);
  }

  private getAllColumnDefs(): ColDef[] {
    return [].concat(this.gridOptions.columnDefs);
  }

  private export(columns: ColDef[]): void {
    const params = this.getExportParams();
    // do not include "Actions" column to the output document.
    const columnsParam = columns.filter((x: ColDef) => x.colId !== 'actions').map((item: ColDef) => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field,
      };
      return container;
    });

    columnsParam.sort((a: ColumnExport, b: ColumnExport) => this.exportOrderColumns.indexOf(a.name) - this.exportOrderColumns.indexOf(b.name));
    this.onExportEvent.emit({ agGridParams: params, columns: columnsParam });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(ResetDisbursementGroupTypes());
    this.store.dispatch(ResetDisbursementGroupStages());
    this.store.dispatch(ResetDeficiencySettingsTemplates());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
