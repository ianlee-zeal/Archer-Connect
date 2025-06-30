import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { combineLatest, Subject } from 'rxjs';

import { Store } from '@ngrx/store';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as fromAuth from '@app/modules/auth/state';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { GridId } from '@app/models/enums/grid-id.enum';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalService } from '@app/services';
import { filter, takeUntil } from 'rxjs/operators';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { DisbursementGroupTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as disbursementGroupSelectors from '@app/modules/disbursement-groups/state/selectors';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DisbursementGroupButtonsRendererComponent } from '@app/modules/disbursement-groups/renderers/disbursement-group-buttons-renderer';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import * as fromShared from '../../shared/state';
import { GetDisbursementGroupsGrid } from '../state/actions';
import { EditDisbursementGroupModalComponent } from '../project-disbursement-groups/edit-disbursement-group-modal/edit-disbursement-group-modal.component';
import * as projectSelectors from '../state/selectors';
import * as projectActions from '../state/actions';
import { PermissionService } from '../../../services/permissions.service';

@Component({
  selector: 'app-project-disbursement-group-list',
  templateUrl: './project-disbursement-group-list.component.html',
  styleUrls: ['./project-disbursement-group-list.component.scss'],
})
export class ProjectDisbursementGroupList implements OnInit, OnDestroy {
  @Input() public projectId: number;

  private deleteDisbursementGroupSuccess$ = this.store.select(projectSelectors.deleteDisbursementGroupSuccess);

  private isImportApproved$ = this.store.select(fromShared.sharedSelectors.uploadBulkDocumentSelectors.isApproved);
  private isImportInProgress$ = this.store.select(fromShared.sharedSelectors.uploadBulkDocumentSelectors.isProcessingInProgress);

  public readonly gridId: GridId = GridId.ProjectDisbursementGroupList;
  public types$ = this.store.select(disbursementGroupSelectors.disbursementGroupTypes);
  public types: SelectOption[] = [];
  public stages$ = this.store.select(disbursementGroupSelectors.disbursementGroupStages);
  public stages: SelectOption[] = [];

  private actionBar: ActionHandlersMap;

  public bsModalRef: BsModalRef;
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  public actionBar$ = this.store.select(projectSelectors.actionBar);
  protected ngUnsubscribe$ = new Subject<void>();
  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'sequence',
        width: 60,
        maxWidth: 60,
        sortable: true,
        resizable: true,
        sort: 'desc',
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        minWidth: 220,
        width: 220,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'typeName',
        sortable: true,
        width: 160,
        minWidth: 160,
        colId: 'type.id',
        ...AGGridHelper.getDropdownColumnFilter({ options: this.types }),
      },
      {
        headerName: 'Stage',
        field: 'stageName',
        sortable: true,
        width: 150,
        minWidth: 150,
        colId: 'stage.id',
        ...AGGridHelper.getDropdownColumnFilter({ options: this.stages }),
      },
      {
        headerName: 'Payment Enabled',
        field: 'isPaymentEnabled',
        colId: 'paymentEnabled',
        sortable: true,
        cellRenderer: 'activeRenderer',
        cellClass: 'ag-cell-before-edit ag-cell-before-edit-centered',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 150,
      },
      {
        headerName: 'EF Req',
        field: 'electionFormRequired',
        sortable: true,
        cellRenderer: 'activeRenderer',
        cellClass: 'ag-cell-before-edit ag-cell-before-edit-centered',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 150,
      },
      {
        headerName: 'Claimant Count',
        sortable: true,
        field: 'claimantCount',
        colId: 'claimantCount',
        width: 130,
        minWidth: 130,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Total Amount',
        sortable: true,
        field: 'totalAmount',
        colId: 'totalAmount',
        cellRenderer: (data: ICellRendererParams): string => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Defense Approved Date',
        field: 'defenseApprovedDate',
        resizable: true,
        sortable: true,
        width: 180,
        minWidth: 180,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Settlement Approved Date',
        field: 'settlementApprovedDate',
        sortable: true,
        width: 190,
        minWidth: 190,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        resizable: false,
        suppressSizeToFit: true,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'ARCHER Approved Date',
        field: 'archerApprovedDate',
        sortable: true,
        width: 190,
        minWidth: 190,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Follow Up Date',
        field: 'followUpDate',
        sortable: true,
        resizable: false,
        suppressSizeToFit: true,
        width: 130,
        minWidth: 130,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        resizable: false,
        suppressSizeToFit: true,
        width: 130,
        minWidth: 130,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value),
        ...AGGridHelper.dateColumnFilter(),
      },
      AGGridHelper.getActionsColumn({
        editButton: {
          handler: this.editDisbursement.bind(this),
          permission: PermissionService.create(PermissionTypeEnum.DisbursementGroups, PermissionActionTypeEnum.Edit),
        },
        /*
        Awaiting requirements.
            goToButton: {
              handler: this.goToListOfClaimants.bind(this),
              title: 'Go To List Of Claimants',
            },
        */
      }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: DisbursementGroupButtonsRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private readonly store: Store<fromShared.AppState>,
    protected readonly router: Router,
    public readonly modalService: ModalService,
    protected readonly elementRef : ElementRef,
    private readonly datePipe: DateFormatPipe,
    private readonly permissionService: PermissionService,
  ) {
  }

  onActionBarUpdated(actionBar): void {
    this.store.dispatch(projectActions.UpdateActionBar({
      actionBar: {
        ...this.actionBar,
        ...actionBar,
      },
    }));
  }

  public ngOnInit(): void {
    this.types$
      .pipe(filter((item: any) => item && !!item.length), takeUntil(this.ngUnsubscribe$))
      .subscribe((types: any) => {
        this.types.splice(0);
        this.types.push({ id: DisbursementGroupTypeEnum.Provisional, name: 'Provisional' }, ...types);
      });

    this.stages$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((stages: SelectOption[]) => {
        this.stages.push(...stages);
      });

    this.actionBar$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((ab: ActionHandlersMap) => {
        this.actionBar = ab;
      });

    combineLatest([this.isImportApproved$, this.isImportInProgress$])
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(([isImportApproved, isImportInProgress]: [boolean, boolean]) => {
        if (isImportApproved && !isImportInProgress) {
          this.store.dispatch(projectActions.RefreshDisbursementGroupList({ projectId: this.projectId }));
        }
      });

      this.deleteDisbursementGroupSuccess$.pipe(
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(isDeleted => {
        if(isDeleted){
          this.modalService.hide();
          this.store.dispatch(projectActions.RefreshDisbursementGroupList({projectId: this.projectId}))
        }
      });
  }
  /*
    Awaiting requirements.

    public goToListOfClaimants(): void {
        // TODO
    }
   */
  public editDisbursement(params: any): void {
    const initialState = {
      title: 'Edit Disbursement Group',
      disbursementGroupId: params.data.id,
    };

    this.modalService.show(EditDisbursementGroupModalComponent, {
      initialState,
      class: 'edit-disbursement-group-modal',
    });
  }

  public fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(GetDisbursementGroupsGrid({ projectId: this.projectId, agGridParams }));
  }

  protected onRowDoubleClicked(row): void {
    if (!row || !this.permissionService.canEdit(PermissionTypeEnum.DisbursementGroups)) {
      return;
    }
    this.editDisbursement(row);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
