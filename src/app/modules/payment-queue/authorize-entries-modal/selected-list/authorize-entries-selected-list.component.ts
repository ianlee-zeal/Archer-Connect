import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ElementRef } from '@angular/core';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store, ActionsSubject } from '@ngrx/store';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { PusherService } from '@app/services/pusher.service';
import { EntityTypeEnum, GridId } from '@app/models/enums';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { AGGridHelper } from '@app/helpers';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { GridOptions } from 'ag-grid-community';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { lienStatuses } from '../../../projects/project-disbursement-payment-queue/state/selectors';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyHelper, SearchOptionsHelper } from '@app/helpers';
import { IGridLocalData } from '@app/state/root.state';
import { MessageService, ModalService, PermissionService, ProductCategoriesService, StagesService } from '@app/services';
import { SplitCamelCasePipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { LogService } from '@app/services/log-service';
import * as paymentQueueActions from '../../../projects/project-disbursement-payment-queue/state/actions';


@Component({
    selector: 'app-authorize-entries-selected-list',
    templateUrl: './authorize-entries-selected-list.component.html',
})
export class AuthorizeEntriesSelectedListComponent extends ListView implements OnInit, OnDestroy {
    @Input() paymentRequestEntityType: EntityTypeEnum;
    @Input() public paymentQueueGridParams: IServerSideGetRowsParamsExtended;
    @Input() public parentGridId: GridId;
    @Output() readonly finish = new EventEmitter<number>();
    @Output() readonly fail = new EventEmitter<string>();

    private paymentQueueGridLocalData: IGridLocalData;

    public readonly gridId: GridId = GridId.AuthorizeEntriesList;

    public readonly ngUnsubscribe$ = new Subject<void>();

    constructor(
        public modal: BsModalRef,
        public store: Store<ProjectsCommonState>,
        public router: Router,
        public elRef: ElementRef<any>,
        public actionsSubj: ActionsSubject,
        public pusher: PusherService,
        protected enumToArray: EnumToArrayPipe,
        public modalService: ModalService,
        public messageService: MessageService,
        public route: ActivatedRoute,
        protected elementRef: ElementRef,
        protected splitCamelCase: SplitCamelCasePipe,
        public permissionService: PermissionService,
        protected logger: LogService,
        protected readonly yesNoPipe: YesNoPipe,
        protected stagesService: StagesService,
        protected productCategoriesService: ProductCategoriesService,
    ) {
        super(router, elRef);
    }

    public lienStatuses$ = this.store.select(lienStatuses);

    public gridOptions: GridOptions = {
        ...AGGridHelper.defaultGridOptions,
        columnDefs: [
            {
                headerName: 'Client ID',
                field: 'clientId',
                width: 80,
                maxWidth: 80,
                sortable: true,
                ...AGGridHelper.fixedColumnDefaultParams,
            },
            {
                headerName: 'Ledger Entry ID',
                field: 'ledgerEntryId',
                colId: 'id',
                width: 100,
                sortable: true,
                ...AGGridHelper.fixedColumnDefaultParams,
            },
            {
                headerName: 'First Name',
                field: 'claimantFirstName',
                sortable: true,
            },
            {
                headerName: 'Last Name',
                field: 'claimantLastName',
                sortable: true,
            },
            {
                headerName: 'Account Number',
                field: 'accountNo',
                sortable: true,
                width: 250,
                minWidth: 250,
            },
            {
                headerName: 'Amount',
                sortable: true,
                field: 'amount',
                cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data),
                width: 250,
                minWidth: 250,
                suppressSizeToFit: false,
            },
        ],
        defaultColDef: {
            ...AGGridHelper.defaultGridOptions.defaultColDef,
            floatingFilter: true,
        },
        components: {
        },
    };


    protected fetchData(gridParams: IServerSideGetRowsParamsExtended): void {
        const searchOpts = SearchOptionsHelper.createSearchOptions(this.paymentQueueGridLocalData, this.paymentQueueGridParams);
        searchOpts.startRow = gridParams.request.startRow;
        searchOpts.endRow = gridParams.request.endRow;
        searchOpts.sortModel = gridParams.request.sortModel;

        this.store.dispatch(paymentQueueActions.GetSelectedPaymentQueueGrid({ searchOpts, agGridParams: gridParams, projectId: null }));
    }

    public ngOnInit(): void {
        this.subscribeToPaymentQueueGridLocalData();

        this.store.dispatch(paymentQueueActions.GetLienPaymentStages());
        this.store.dispatch(paymentQueueActions.GetLienStatuses());
        this.store.dispatch(paymentQueueActions.GetBankruptcyStages());
    }

    private subscribeToPaymentQueueGridLocalData(): void {
        this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: this.parentGridId }))
            .pipe(first())
            .subscribe((data: IGridLocalData) => {
                this.paymentQueueGridLocalData = data;
            });
    }

    public ngOnDestroy(): void {
        this.store.dispatch(rootActions.ClearGridLocalData({ gridId: this.gridId }));
        super.ngOnDestroy();
    }
}
