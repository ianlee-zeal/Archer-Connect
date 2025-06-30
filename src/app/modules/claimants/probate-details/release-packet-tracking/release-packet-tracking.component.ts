import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHelper, StringHelper } from '@app/helpers';
import { MessageService } from '@app/services';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ClientContactSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/client-contact-selection-modal.component';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DropdownEditorRendererComponent } from '@app/modules/shared/_renderers/dropdown-editor-renderer/dropdown-editor-renderer.component';
import { ModalEditorRendererComponent } from '@app/modules/shared/_renderers/modal-editor-renderer/modal-editor-renderer.component';
import { TextboxEditorRendererComponent, TextboxEditorRendererDataType } from '@app/modules/shared/_renderers/textbox-editor-renderer/textbox-editor-renderer.component';
import { Store } from '@ngrx/store';
import { CellRendererSelectorResult, CellValueChangedEvent, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Subject } from 'rxjs';
import cloneDeep from 'lodash-es/cloneDeep';
import { EntityTypeEnum } from '@app/models/enums';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { IdValue, Person } from '@app/models';
import { filter, takeUntil } from 'rxjs/operators';
import { PacketRequest } from '@app/models/packet-request';
import { DateFormatPipe } from '@app/modules/shared/_pipes/date-format.pipe';
import { DateRendererComponent } from '@app/modules/shared/_renderers/date-renderer/date-renderer.component';
import { GridDateSelectorComponent } from '@app/modules/shared/grid/grid-date-selector/grid-date-selector.component';
import { MultiselectDropdownEditorRendererComponent } from '@app/modules/shared/_renderers/multiselect-dropdown-editor-renderer/multiselect-dropdown-editor-renderer.component';
import { AddressPipe } from '@app/modules/shared/_pipes';
import { DateHelper } from '@app/helpers/date.helper';
import moment from 'moment-timezone';
import * as actions from '../../state/actions';
import * as selectors from '../../state/selectors';
import { ReleasePacketActionsRendererComponent } from './actions-renderer/release-packet-actions-renderer.component';

@Component({
  selector: 'app-release-packet-tracking',
  templateUrl: './release-packet-tracking.component.html',
  styleUrls: ['./release-packet-tracking.component.scss'],
})
export class ReleasePacketTrackingComponent extends ListView implements OnInit, OnDestroy {
  public gridId: GridId = GridId.ReleasePacketTracking;
  public packetStatuses: IdValue[] = [];
  public missingDocsOptions: IdValue[] = [];
  public docsToSendOptions: IdValue[] = [];
  public allDocuments: IdValue[] = [];
  public errorMessages: string[] = [];
  public canEdit: boolean = false;
  public packetRequests: PacketRequest[] = [];

  @Input() clientId: number;
  @Input() packetRequestsOriginal: PacketRequest[];
  @Input() probateId: number;
  @Output() readonly packetRequestsSave = new EventEmitter<PacketRequest[]>();

  private statusOpts$ = this.store.select(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.PacketRequests }));
  public readonly ngUnsubscribe$ = new Subject<void>();
  private missingDocsOptions$ = this.store.select(selectors.missingDocsOptions);
  private docsToSendOptions$ = this.store.select(selectors.docsToSendOptions);
  private allDocuments$ = this.store.select(selectors.allDocuments);

  constructor(
    private store: Store<any>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private datePipe: DateFormatPipe,
    private addressPipe: AddressPipe,
    private messageService: MessageService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.PacketRequests }));
    this.store.dispatch(actions.GetAllMissingDocs());
    this.store.dispatch(actions.GetAllDocsToSend());
    this.store.dispatch(actions.GetDocumentsByProbateId({ probateId: this.probateId }));

    this.statusOpts$.pipe(
      filter((s: IdValue[]) => s && s.length && !this.packetStatuses.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((opts: IdValue[]) => {
      const selectOpts = opts.map((o: IdValue) => ({ id: o.id, name: o.name }));
      this.packetStatuses.push(...selectOpts);
      if (this.gridApi) {
        this.gridApi.redrawRows();
        this.gridApi.refreshHeader();
      }
    });

    this.missingDocsOptions$.pipe(
      filter((s: IdValue[]) => s && s.length && !this.missingDocsOptions.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((opts: IdValue[]) => {
      const selectOpts = opts.map((o: IdValue) => ({ id: o.id, name: o.name }));
      this.missingDocsOptions.push(...selectOpts);
      if (this.gridApi) {
        this.gridApi.refreshHeader();
      }
    });

    this.docsToSendOptions$.pipe(
      filter((s: IdValue[]) => s && s.length && !this.docsToSendOptions.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((opts: IdValue[]) => {
      const selectOpts = opts.map((o: IdValue) => ({ id: o.id, name: o.name }));
      this.docsToSendOptions.push(...selectOpts);
      if (this.gridApi) {
        this.gridApi.refreshHeader();
      }
    });

    this.allDocuments$.pipe(
      filter((s: IdValue[]) => s && s.length && !this.allDocuments.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((opts: IdValue[]) => {
      const selectOpts = opts.map((o: IdValue) => ({ id: o.id, name: o.name }));
      this.allDocuments.push(...selectOpts);
    });

    this.validate();
  }

  public actionBar: ActionHandlersMap = {
    new: { callback: () => this.onAddNewRecord() },
    edit: {
      callback: () => this.onEdit(),
      hidden: () => this.canEdit || !this.packetRequests?.length,
    },
    cancel: {
      callback: () => this.onCancel(),
      hidden: () => !this.canEdit,
    },
    save: {
      callback: () => this.onSave(),
      hidden: () => !this.canEdit,
      disabled: () => !this.isValid,
    },
  };

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    getRowId: (data: any): string => `${data?.data?.id?.toString()}`,
    columnDefs: [
      {
        headerName: 'Packet Recipient',
        field: 'clientContactModal',
        editable: (): boolean => this.canEdit,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => {
          const modalComponent = ClientContactSelectionModalComponent;
          return AGGridHelper.getModalRenderer({
            modalComponent,
            modalConfig: {
              initialState: { clientId: this.clientId },
              class: 'entity-selection-modal',
            },
            selectedId: params.value?.id,
            displayedField: 'clientContactName',
            placeholder: 'Select Contact',
            additionalInfoField: 'clientContactInfo',
            convertToAdditionalInfo: (entity: any) => ({
              primaryAddress: entity?.person?.primaryAddress,
              firstName: entity?.person?.firstName,
              middleName: entity?.person?.middleName,
              lastName: entity?.person?.lastName,
            }),
          });
        },
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Full Name',
        field: 'clientContactFullName',
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Address',
        field: 'clientContactAddress',
        cellRenderer: 'textBoxRenderer',
        autoHeight: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'Packet Status',
        field: 'statusId',
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => this.getEditableClass(),
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getDropdownRenderer({
            values: this.packetStatuses,
            value: params.value,
            placeholder: 'Packet Status',
            disabledPlaceholder: true,
          })),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 215,
        width: 215,
      },
      {
        headerName: 'Docs to send',
        field: 'packetRequestToProbateDocsToSendsIds',
        autoHeight: true,
        wrapText: true,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => this.getEditableClass(),
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getMultiselectDropdownEditorRenderer({
            options: this.docsToSendOptions,
            values: params.value,
            placeholder: 'Docs to send',
          })),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Missing Docs',
        field: 'packetRequestToProbateMissingDocsIds',
        autoHeight: true,
        wrapText: true,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => this.getEditableClass(),
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getMultiselectDropdownEditorRenderer({
            options: this.missingDocsOptions,
            values: params.value,
            placeholder: 'Missing Docs',
          })),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Files to Include',
        field: 'documentsIds',
        autoHeight: true,
        wrapText: true,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => this.getEditableClass(),
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getMultiselectDropdownEditorRenderer({
            options: this.allDocuments,
            values: params.value,
            placeholder: 'Files to Include',
            isWide: true,
          })),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Date Requested',
        field: 'dateRequested',
        minWidth: 150,
        maxWidth: 150,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => (this.getEditableClass()),
        cellRendererSelector: this.dateCellRendererSelector.bind(this),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Date Mailed',
        field: 'dateMailed',
        minWidth: 150,
        maxWidth: 150,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => (this.getEditableClass()),
        cellRendererSelector: this.dateCellRendererSelector.bind(this),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Date Received',
        field: 'dateReceived',
        minWidth: 150,
        maxWidth: 150,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => (this.getEditableClass()),
        cellRendererSelector: this.dateCellRendererSelector.bind(this),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Tracking No',
        field: 'trackingNo',
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => (this.getEditableClass()),
      },
      {
        headerName: 'Track Packet',
        field: 'trackPacket',
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => (this.getEditableClass()),
      },
      {
        headerName: 'Notes',
        field: 'notes',
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
        editable: (): boolean => this.canEdit,
        cellClass: (): string | string[] => (this.getEditableClass()),
        width: 300,
      },
      AGGridHelper.getActionsColumn({ deleteHandler: this.onDeleteHandler.bind(this), hidden: this.isDeleteButtonHidden.bind(this) }),
    ],
    suppressClickEdit: true,
    suppressRowClickSelection: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onCellValueChanged: this.onCellValueChanged.bind(this),
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    components: {
      buttonRenderer: ReleasePacketActionsRendererComponent,
      agDateInput: GridDateSelectorComponent,
      textBoxRenderer: TextboxEditorRendererComponent,
      dropdownRenderer: DropdownEditorRendererComponent,
      modalRenderer: ModalEditorRendererComponent,
      dateRenderer: DateRendererComponent,
      multiselectDropdownEditorRenderer: MultiselectDropdownEditorRendererComponent,
    },
  } as GridOptions;

  public readonly gridOptionsReadonly: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Packet Recipient',
        field: 'clientContactName',
        sortable: true,
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Full Name',
        field: 'clientContactFullName',
        cellRenderer: 'textBoxRenderer',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Address',
        field: 'clientContactAddress',
        cellRenderer: 'textBoxRenderer',
        sortable: true,
        autoHeight: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.addressColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Packet Status',
        field: 'status.id',
        sortable: true,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getTextBoxRenderer({
            value: params.data?.status?.name || '',
            type: TextboxEditorRendererDataType.Text,
          })
        ),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({
          options: this.packetStatuses,
        }, 'customSetColumnFilter'),
        minWidth: 215,
        width: 215,
      },
      {
        headerName: 'Docs to send',
        field: 'packetRequestToProbateDocsToSendsIds',
        sortable: true,
        autoHeight: true,
        wrapText: true,
        comparator: (valueA: number[], valueB: number[]): number => AGGridHelper.arrayComparatorWithOptions(this.docsToSendOptions, valueA, valueB),
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getTextBoxRenderer({
            value: params.data.packetRequestToProbateDocsToSendsIdsDisplay || '',
            type: TextboxEditorRendererDataType.Text,
          })
        ),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({
          options: this.docsToSendOptions,
        }, 'customSetColumnFilter'),
      },
      {
        headerName: 'Missing Docs',
        field: 'packetRequestToProbateMissingDocsIds',
        sortable: true,
        autoHeight: true,
        wrapText: true,
        comparator: (valueA: number[], valueB: number[]): number => AGGridHelper.arrayComparatorWithOptions(this.missingDocsOptions, valueA, valueB),
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getTextBoxRenderer({
            value: params.data.packetRequestToProbateMissingDocsIdsDisplay || '',
            type: TextboxEditorRendererDataType.Text,
          })
        ),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({
          options: this.missingDocsOptions,
        }, 'customSetColumnFilter'),
      },
      {
        headerName: 'Files to Include',
        field: 'documentsIds.length',
        sortable: true,
        autoHeight: true,
        wrapText: true,
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getTextBoxRenderer({
            value: params.value || '',
            type: TextboxEditorRendererDataType.Text,
          })
        ),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Date Requested',
        field: 'dateRequested',
        minWidth: 150,
        maxWidth: 150,
        sortable: true,
        cellRendererSelector: this.dateCellRendererSelector.bind(this),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateOnlyColumnFilter(),
      },
      {
        headerName: 'Date Mailed',
        field: 'dateMailed',
        minWidth: 150,
        maxWidth: 150,
        sortable: true,
        cellRendererSelector: this.dateCellRendererSelector.bind(this),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateOnlyColumnFilter(),
      },
      {
        headerName: 'Date Received',
        field: 'dateReceived',
        minWidth: 150,
        maxWidth: 150,
        sortable: true,
        cellRendererSelector: this.dateCellRendererSelector.bind(this),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateOnlyColumnFilter(),
      },
      {
        headerName: 'Tracking No',
        field: 'trackingNo',
        sortable: true,
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Track Packet',
        field: 'trackPacket',
        sortable: true,
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Notes',
        field: 'notes',
        sortable: true,
        cellRenderer: 'textBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
        width: 300,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    suppressClickEdit: true,
    suppressRowClickSelection: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onCellValueChanged: this.onCellValueChanged.bind(this),
    components: {
      buttonRenderer: ReleasePacketActionsRendererComponent,
      agDateInput: GridDateSelectorComponent,
      textBoxRenderer: TextboxEditorRendererComponent,
      dropdownRenderer: DropdownEditorRendererComponent,
      modalRenderer: ModalEditorRendererComponent,
      dateRenderer: DateRendererComponent,
      multiselectDropdownEditorRenderer: MultiselectDropdownEditorRendererComponent,
    },
  } as GridOptions;

  private dateCellRendererSelector(params: ICellRendererParams): CellRendererSelectorResult {
    return this.canEdit
      ? AGGridHelper.getDateRenderer({
        value: params.value,
        maxWidth: 110,
      })
      : AGGridHelper.getTextBoxRenderer({
        value: this.datePipe.transform(params.value, false, null, null, true),
        type: TextboxEditorRendererDataType.Text,
      });
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.gridApi.setGridOption('rowData', this.packetRequests);
    this.gridApi.resetColumnState();
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.packetRequestsOriginal) {
      this.packetRequests = cloneDeep(this.packetRequestsOriginal) || [];
      if (this.gridApi) this.gridApi.setGridOption('rowData', this.packetRequests);
    }

    setTimeout(() => this.validate());
  }

  public onSave(): void {
    if (!this.validate()) return;
    this.packetRequestsSave.emit(this.packetRequests);
    this.toggleEditMode(false);
    if (this.gridApi) this.gridApi.undoCellEditing();
  }

  public onEdit(): void {
    this.toggleEditMode(true);
  }

  public onCancel(): void {
    const originalData = cloneDeep(this.packetRequestsOriginal);
    this.packetRequests = originalData;
    this.toggleEditMode(false);
    this.validate();

    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', originalData);
      this.gridApi.undoCellEditing();
    }
  }

  private toggleEditMode(value = !this.canEdit): void {
    this.canEdit = value;
    if (value) this.validate();
    if (this.gridApi) this.gridApi.redrawRows();
  }

  public onAddNewRecord(): void {
    const newRequest: PacketRequest = {
      id: CommonHelper.createEntityUniqueId(),
      dateRequested: DateHelper.toLocalDate(moment().toISOString()),
      statusId: null,
      status: null,
      dateMailed: null,
      dateReceived: null,
      trackingNo: '',
      trackPacket: '',
      notes: '',
      productDetailsProbateId: this.probateId,
      packetRequestToProbateDocsToSends: [],
      packetRequestToProbateMissingDocs: [],
      packetRequestToProbateDocsToSendsIds: [],
      packetRequestToProbateMissingDocsIds: [],
      packetRequestToProbateDocsToSendsIdsDisplay: '',
      packetRequestToProbateMissingDocsIdsDisplay: '',
      documents: [],
      documentsIds: [],
      clientContactId: null,
      clientContactModal: new IdValue(undefined, undefined),
      clientContactName: undefined,
      clientContactFullName: undefined,
      clientContactInfo: {
        primaryAddress: undefined,
        firstName: undefined,
        middleName: undefined,
        lastName: undefined,
      },
      clientContactAddress: '',
    };

    const updatedValues = [newRequest];
    if (this.packetRequests) {
      updatedValues.push(...this.packetRequests);
    }

    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', updatedValues);
    }

    this.packetRequests = updatedValues;
    this.toggleEditMode(true);
  }

  private onCellValueChanged(event: CellValueChangedEvent): void {
    const updatedValues = [...this.packetRequests];
    const rowData = event.data;
    const colId = event.column.getColId();
    const targetItemIndex = event.rowIndex;

    switch (colId) {
      case 'clientContactModal':
      {
        updatedValues[targetItemIndex].clientContactId = StringHelper.parseInt(rowData.clientContactModal);
        updatedValues[targetItemIndex].clientContactModal = new IdValue(StringHelper.parseInt(rowData.clientContactModal), rowData.clientContactName);
        updatedValues[targetItemIndex].clientContactName = rowData.clientContactName;
        updatedValues[targetItemIndex].clientContactInfo = rowData.clientContactInfo;
        updatedValues[targetItemIndex].clientContactAddress = rowData.clientContactInfo?.primaryAddress
          ? this.addressPipe.transform(rowData.clientContactInfo.primaryAddress)
          : '';
        updatedValues[targetItemIndex].clientContactFullName = rowData.clientContactInfo
          ? Person.getFirstMiddleLastName(rowData.clientContactInfo)
          : '';
        break;
      }
      case 'statusId':
      {
        updatedValues[targetItemIndex].statusId = rowData.statusId;
        break;
      }
      case 'packetRequestToProbateDocsToSendsIds':
      {
        updatedValues[targetItemIndex].packetRequestToProbateDocsToSendsIds = rowData.packetRequestToProbateDocsToSendsIds;
        break;
      }
      case 'packetRequestToProbateMissingDocsIds':
      {
        updatedValues[targetItemIndex].packetRequestToProbateMissingDocsIds = rowData.packetRequestToProbateMissingDocsIds;
        break;
      }
      case 'documentsIds':
      {
        updatedValues[targetItemIndex].documentsIds = rowData.documentsIds;
        const documents = [];
        if (rowData.documentsIds) {
          for (let i = 0; i < rowData.documentsIds?.length; i++) {
            const element = rowData.documentsIds[i];
            documents.push({
              id: element,
              name: this.allDocuments.find((d: IdValue) => d.id === element)?.name || '',
            });
          }
        }
        updatedValues[targetItemIndex].documents = documents;
        break;
      }
      case 'dateRequested':
      {
        updatedValues[targetItemIndex].dateRequested = rowData.dateRequested;
        break;
      }
      case 'dateMailed':
      {
        updatedValues[targetItemIndex].dateMailed = rowData.dateMailed;
        break;
      }
      case 'dateReceived':
      {
        updatedValues[targetItemIndex].dateReceived = rowData.dateReceived;
        break;
      }
      case 'trackingNo':
      {
        updatedValues[targetItemIndex].trackingNo = rowData.trackingNo;
        break;
      }
      case 'trackPacket':
      {
        updatedValues[targetItemIndex].trackPacket = rowData.trackPacket;
        break;
      }
      case 'notes':
      {
        updatedValues[targetItemIndex].notes = rowData.notes;
        break;
      }

      // updatedValues[targetItemIndex][colId] = rowData[colId]; // ???
    }

    if (colId === 'clientContactModal'
    || colId === 'packetRequestToProbateDocsToSendsIds'
    || colId === 'packetRequestToProbateMissingDocsIds'
    || colId === 'documentsIds') {
      this.gridApi.setGridOption('rowData', updatedValues);
    }

    this.packetRequests = updatedValues;
    this.validate();
  }

  private onDeleteHandler(params): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete this release packet?',
    )
      .subscribe((answer: boolean) => {
        if (!answer) return;
        this.packetRequests = this.packetRequests.filter(
          (item: PacketRequest) => item.id !== params?.data?.id,
        );
        if (this.gridApi) {
          this.gridApi.setGridOption('rowData', this.packetRequests);
        }
      });
  }

  private isDeleteButtonHidden(): boolean {
    return this.canEdit;
  }

  public get isValid(): boolean {
    return this.errorMessages.length === 0;
  }

  public validate(): boolean {
    const errors = [];
    if (!this.packetRequests) {
      this.errorMessages = [];
      return true;
    }
    const items = [...this.packetRequests];

    items.forEach((item: PacketRequest, index: number) => {
      const fields = [];
      if (CommonHelper.isNullOrUndefined(item.clientContactModal?.id) || CommonHelper.isBlank(item.clientContactModal?.name?.toString())) {
        fields.push('Packet Recipient');
      }
      if (CommonHelper.isNullOrUndefined(item.statusId)) {
        fields.push('Packet Status');
      }
      if (!item.packetRequestToProbateDocsToSendsIds || item.packetRequestToProbateDocsToSendsIds.length === 0) {
        fields.push('Docs to send');
      }
      if (!item.packetRequestToProbateMissingDocsIds || item.packetRequestToProbateMissingDocsIds.length === 0) {
        fields.push('Missing Docs');
      }
      if (CommonHelper.isNullOrUndefined(item.dateRequested)) {
        fields.push('Date Requested');
      }
      if (fields.length > 0) {
        errors.push(`${fields.join(', ')} ${fields.length === 1 ? 'is' : 'are'} required in row # ${index + 1}.`);
      }
    });

    if (errors.length > 0) {
      this.errorMessages = errors;
      return false;
    }

    this.errorMessages = [];
    return true;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
