/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@app/state';
import { ActionsSubject, Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { GridOptions } from 'ag-grid-community';
import * as paymentActions from '@app/modules/payments/state/actions';
import * as selectors from '@app/modules/payments/state/selectors';
import { ModalService } from '@app/services';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { filter, takeUntil } from 'rxjs/operators';
import { Payment } from '@app/models/payment';
import { CheckVerificationGrid } from '@app/models/check-verification/check-verification-grid';
import { ofType } from '@ngrx/effects';
import { CheckVerificationListActionsRendererComponent } from './check-verification-list-actions-renderer/check-verification-list-actions-renderer.component';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-check-verification-list',
  templateUrl: './check-verification-list.component.html',
  styleUrls: ['./check-verification-list.component.scss'],
})
export class CheckVerificationListComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.PaymentCheckVerificatoinList;
  public payment: Payment;
  public readonly payment$ = this.store.select(selectors.item);

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Date Created',
        field: 'createdDate',
        colId: 'checkVerifications.createdDate',
        sort: 'desc',
        cellRenderer: data => this.datePipe.transform(data.value, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateOnlyColumnFilter(),
        filter: false,
      },
      {
        headerName: 'ARCHER Agent',
        field: 'createdBy.displayName',
        colId: 'checkVerifications.createdBy.displayName',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
      },
      {
        headerName: 'Financial Institution',
        field: 'financialInstitution',
        colId: 'checkVerifications.financialInstitution',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
      },
      {
        headerName: 'Agent\'s Name',
        field: 'agentsName',
        colId: 'checkVerifications.agentsName',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
      },
      {
        headerName: 'Phone Number',
        field: 'phone',
        colId: 'checkVerifications.phone',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
      },
      {
        headerName: 'Comments',
        field: 'note',
        colId: 'checkVerifications.note',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
      },
      AGGridHelper.getActionsColumn({
        editHandler: this.openModal.bind(this),
        downloadHandler: this.downloadAttachments.bind(this),
      }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    suppressRowClickSelection: true,
    components: { buttonRenderer: CheckVerificationListActionsRendererComponent },
  };

  constructor(
    private readonly store: Store<AppState>,
    private readonly datePipe: DateFormatPipe,
    public readonly modalService: ModalService,
    private readonly actionsSubj: ActionsSubject,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.payment$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(data => !!data),
    ).subscribe(data => {
      this.payment = data;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(paymentActions.SubmitCheckVerificationComplete),
    ).subscribe(() => this.refreshGrid());
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = { ...agGridParams };
    this.gridParams.request.filterModel.push(new FilterModel({
      filter: this.payment.id,
      filterType: FilterTypes.Number,
      key: 'id',
      type: 'equals',
    }));
    this.store.dispatch(paymentActions.GetCheckVerificationList({ agGridParams }));
  }

  private refreshGrid() {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  openModal(params) {
    const checkVerification = params.data as CheckVerificationGrid;
    this.store.dispatch(paymentActions.EditCheckVerificationModal({ checkVerificationId: checkVerification.id, editMode: true }));
  }

  downloadAttachments({ data }) {
    const checkVerification = data as CheckVerificationGrid;
    this.store.dispatch(paymentActions.DownloadCheckVerificationAttachments({ id: checkVerification.id }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
