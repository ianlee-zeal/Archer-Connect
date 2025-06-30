import { Document } from '@app/models/documents';
import { Component, Input, OnInit, ElementRef, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { filter, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Note } from '@app/models';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { EntityTypeEnum, FileImportDocumentType, FileImportETLStatusEnum, JobNameEnum } from '@app/models/enums';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ContextBarElement } from '@app/entities';
import { CommonHelper } from '@app/helpers/common.helper';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as fromAuth from '@app/modules/auth/state/index';
import { PusherService } from '@app/services/pusher.service';
import { StringHelper } from '@app/helpers';
import * as projectSelectors from '../../../../../state/selectors';
import * as projectActions from '../../../../../state/actions';

@Component({
  selector: 'app-disbursement-payment-request-review-step',
  templateUrl: './disbursement-payment-request-review-step.component.html',
  styleUrls: ['./disbursement-payment-request-review-step.component.scss'],
})
export class DisbursementPaymentRequestReviewStepComponent extends ListView implements OnInit {
  @Input() projectId: number;
  @Input() projectName: number;
  @Input() jobId: number;
  @Input() attachments: Document[] = [];

  @Output() readonly fail = new EventEmitter<string>();
  @Output() readonly reviewIsCompleted = new EventEmitter();

  readonly gridId = GridId.ManualPaymentRequestReviewGrid;
  public userName: string;
  public processLogDocId: number;
  public headerElements: ContextBarElement[];
  public form = new UntypedFormGroup({ note: new UntypedFormControl('', Validators.required) });

  get isValid(): boolean {
    return (!this.form || this.form.valid);
  }
  public user$ = this.store.select(fromAuth.authSelectors.getUser);
  readonly paymentRequestImportsResult$ = this.store.select(projectSelectors.paymentRequestImportsResult);

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Payee',
        field: 'Payee',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payee ID',
        field: 'PayeeId',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payment Type',
        field: 'PaymentType',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Amount',
        field: 'Amount',
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payment Method',
        field: 'PaymentMethod',
        ...AGGridHelper.nameColumnDefaultParams,
      },

    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: false,
    },
    suppressRowClickSelection: true,
  };

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    router: Router,
    elementRef: ElementRef,
    private readonly pusher: PusherService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.subscribeToUser();
    this.subscribeToPaymentRequestImportsResult();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.jobId && this.jobId && !CommonHelper.isNullOrUndefined(this.jobId)) {
      this.store.dispatch(projectActions.GetPaymentRequestImportsResultRequest({
        entityId: this.jobId,
        documentTypeId: FileImportDocumentType.Preview,
      }));
    }
  }

  private subscribeToUser() {
    this.user$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.userName = user.displayName;
    });
  }

  private subscribeToPaymentRequestImportsResult() {
    this.paymentRequestImportsResult$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(data => !!data),
      )
      .subscribe(paymentData => {
        const rows = paymentData.rows.map(item => (item.fields)).filter(item => item.QsfOrgName);
        const total = rows.reduce((sum, cur) => sum + cur.Amount, 0);
        const qsf = rows[0].QsfOrgName;

        this.setGridRowDataWithDelay(rows);
        this.headerElements = [
          { column: 'Total', valueGetter: () => CurrencyHelper.toUsdFormat({ value: total }) },
          { column: 'Requestor', valueGetter: () => this.userName },
          { column: 'QSF', valueGetter: () => qsf },
          { column: 'Project', valueGetter: () => this.projectName },
        ];
      });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
  }

  private getChannelName(): string {
    return StringHelper.generateChannelName(
      JobNameEnum.ManualPaymentRequestSubmit,
      this.projectId,
      EntityTypeEnum.PaymentRequest,
    );
  }

  private generatePaymentRequestCallback(data: any, event: string) {
    switch (event) {
      case FileImportETLStatusEnum[FileImportETLStatusEnum.Complete]:
        this.createManualPaymentRequestDocs();
        this.unsubscribeFromChannel();
        this.reviewIsCompleted.emit();
        break;
      case FileImportETLStatusEnum[FileImportETLStatusEnum.Error]:
        this.fail.emit(data.ErrorMessage);
        this.unsubscribeFromChannel();
        break;
    }
  }

  private createManualPaymentRequestDocs() {
    const note = new Note();
    note.id = 0;
    note.html = this.form.get('note').value;
    note.entityId = 0;
    note.entityTypeId = EntityTypeEnum.PaymentRequest;

    const manualPaymentRequestDocs = {
      caseId: this.projectId,
      additionalDocuments: this.attachments,
      note: this.form.get('note').value,
    };

    this.store.dispatch(projectActions.ManualPaymentRequestDocsRequest({ manualPaymentRequestDocs }));
  }

  public onSubmit() {
    // eslint-disable-next-line no-restricted-globals
    const pusherEvents = Object.keys(FileImportETLStatusEnum).filter(key => !isNaN(Number(FileImportETLStatusEnum[key.toString()])));

    const submitData = {
      channelName: this.getChannelName(),
      documentImportId: this.jobId,
    };

    this.unsubscribeFromChannel();
    this.channel = this.pusher.subscribeChannel(
      submitData.channelName,
      pusherEvents,
      this.generatePaymentRequestCallback.bind(this),
      () => (this.store.dispatch(projectActions.SubmitPaymentRequestImportsResultRequest({ submitData }))),
    );
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }
}
