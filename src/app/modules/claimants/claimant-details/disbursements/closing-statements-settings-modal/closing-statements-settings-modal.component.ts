import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { GridId } from '@app/models/enums/grid-id.enum';
import { CellRendererSelectorResult, CellValueChangedEvent, GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Router } from '@angular/router';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { DropdownEditorRendererComponent, IDropdownEditorRendererParams } from '@app/modules/shared/_renderers/dropdown-editor-renderer/dropdown-editor-renderer.component';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { PayeeItem } from '@app/models/closing-statement/payee-item';
import { GridHeaderValidationStatusComponent, IGridHeaderValidationStatusParams } from '@app/modules/shared/grid/grid-header-validation-status/grid-header-validation-status.component';
import { PermissionActionTypeEnum, PermissionTypeEnum, ValidationStatus } from '@app/models/enums';
import { Dictionary, IDictionary } from '@app/models/utils';
import { Address, Email, EntityAddress } from '@app/models';
import { SelectHelper } from '@app/helpers/select.helper';
import { AddressPipe } from '@app/modules/shared/_pipes';
import { EntityPair } from '@app/modules/shared/_interfaces';
import { ofType } from '@ngrx/effects';
import { PermissionService } from '@app/services';
import * as rootActions from '@app/state/root.actions';
import { SelectGroupsEnum } from '@app/models/enums/select-groups.enum';
import * as actions from '../../state/actions';
import * as selectors from '../../state/selectors';
import { ClaimantDetailsState } from '../../state/reducer';
import { TextTagRendererComponent } from '../../../../shared/_renderers/text-tag-renderer/text-tag-renderer.component';

@Component({
  selector: 'app-closing-statements-settings-modal',
  templateUrl: './closing-statements-settings-modal.component.html',
  styleUrls: ['./closing-statements-settings-modal.component.scss'],
})
export class ClosingStatementsSettingsModalComponent extends ListView implements OnInit, OnDestroy {
  readonly gridId = GridId.ClaimantClosingStatementSettings;

  private readonly payees$ = this.store.select(selectors.payeeItems);
  private readonly ledgerInfo$ = this.store.select(selectors.ledgerInfo);
  private readonly data$ = this.store.select(selectors.closingStatementSettingsData);

  private addressesByEntity: IDictionary<string, EntityAddress[]> = new Dictionary();
  private emailsByEntity: IDictionary<string, Email[]> = new Dictionary();
  private templates: SelectOption[] = [];
  public ledgerId: number;
  public payeeItems: PayeeItem[];

  public readonly canEditPermission = PermissionService.create(PermissionTypeEnum.ClaimantClosingStatementSettings, PermissionActionTypeEnum.Edit);

  protected editEnabled = true;

  readonly valid$ = this.payees$.pipe(
    filter(item => !!item),
    map(items => this.isAllValid(items)),
  );

  readonly awaitedCheckActionTypes = [
    actions.UpdateClosingStatementSettingsSuccess.type,
    actions.Error.type,
    rootActions.SetAllRowSelected,
  ];

  constructor(
    private readonly modal: BsModalRef,
    private readonly store: Store<ClaimantDetailsState>,
    private readonly addressPipe: AddressPipe,
    private readonly actionsSubj: ActionsSubject,
    router: Router,
    elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  readonly gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Receive CS',
        headerTooltip: 'Payee will receive CS',
        field: 'willReceiveCS',
        width: 100,
        maxWidth: 100,
        cellRenderer: 'checkBoxRenderer',
        checkboxSelection: false,
        editable: () => this.editEnabled,
        cellClass: () => this.getEditableClass(this.editEnabled),
        pinned: true,
      },
      {
        headerName: 'Payee Name',
        headerTooltip: 'Payee Name',
        field: 'payeeName',
        cellRendererSelector: this.onTaggedNameCellRendererSelect.bind(this),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Relationship',
        headerTooltip: 'Relationship',
        field: 'payeeRole',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Address',
        headerTooltip: 'Address',
        field: 'addressLinkId',
        minWidth: 300,
        cellRendererSelector: this.onAddressCellRendererSelect.bind(this),
        editable: () => this.editEnabled,
        cellClass: () => this.getEditableClass(),
        headerComponent: GridHeaderValidationStatusComponent,
        headerComponentParams: this.getValidationParams(this.addressIsValid),
      },
      {
        headerName: 'Email',
        headerTooltip: 'Email',
        field: 'emailId',
        minWidth: 300,
        cellRendererSelector: this.onEmailCellRendererSelect.bind(this),
        editable: () => this.editEnabled,
        cellClass: () => this.getEditableClass(),
        headerComponent: GridHeaderValidationStatusComponent,
        headerComponentParams: this.getValidationParams(this.emailIsValid),
      },
      {
        headerName: 'Closing Statement Template',
        headerTooltip: 'Closing Statement Template',
        field: 'documentTemplateId',
        minWidth: 230,
        cellRendererSelector: this.onTemplateCellRendererSelect.bind(this),
        editable: () => this.editEnabled,
        cellClass: () => this.getEditableClass(),
        headerComponent: GridHeaderValidationStatusComponent,
        headerComponentParams: this.getValidationParams(this.templateIsValid),
      },
      {
        headerName: 'Electronic Delivery',
        headerTooltip: 'Electronic Delivery',
        field: 'isElectronicEnabled',
        maxWidth: 240,
        cellRenderer: 'checkBoxRenderer',
        editable: () => this.editEnabled,
        cellClass: () => this.getEditableClass(this.editEnabled),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    components: {
      textTagRenderer: TextTagRendererComponent,
      checkBoxRenderer: CheckboxEditorRendererComponent,
      dropdownRenderer: DropdownEditorRendererComponent,
    },
    onCellValueChanged: this.onCellValueChanged.bind(this),
    suppressClickEdit: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    pagination: false,
  };

  ngOnInit(): void {
    this.ledgerInfo$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(ledgerInfo => {
        this.ledgerId = ledgerInfo.id;

        this.store.dispatch(actions.GetClosingStatementSettingsList({ ledgerId: ledgerInfo.id }));
        this.store.dispatch(actions.GetClosingStatementSettingsDataRequest({ projectId: ledgerInfo.projectId, isProjectAssociated: true }));
      });

    this.data$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      if (data.closingStatementTemplates) {
        this.templates = data.closingStatementTemplates;
      }
      let redrawRows = false;
      if (data.addressesByEntity) {
        this.addressesByEntity = data.addressesByEntity;
        if (this.gridApi) {
          redrawRows = true;
        }
      }
      if (data.emailsByEntity) {
        this.emailsByEntity = data.emailsByEntity;
        if (this.gridApi) {
          redrawRows = true;
        }
      }
      if (redrawRows && this.gridApi) {
        this.gridApi.redrawRows();
      }
    });

    this.payees$.pipe(
      filter(items => !!items),
      distinctUntilChanged((previous: PayeeItem[], current: PayeeItem[]) => previous.length === current.length
          && previous.every((prevElem: PayeeItem) =>
            current.some((curElem: PayeeItem) =>
              prevElem.destinationEntityId === curElem.destinationEntityId
              && prevElem.destinationEntityTypeId === curElem.destinationEntityTypeId
            )
          )
      ),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(items => {
      const entityPairs: EntityPair[] = [];
      items.forEach(item => {
        entityPairs.push({ entityId: item.destinationEntityId, entityTypeId: item.destinationEntityTypeId });
      });
      this.loadAddresses(entityPairs);
      this.loadEmails(entityPairs);
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.UpdateClosingStatementSettingsSuccess),
    ).subscribe(() => {
      this.modal.hide();
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(rootActions.SetAllRowSelected),
    ).subscribe(data => {
      this.gridApi.forEachNode(node => {
        node.data.willReceiveCS = data.isAllRowSelected;
      });
      this.gridApi.redrawRows();
      this.payeeItems = this.gridApi.getRenderedNodes().map(node => node.data as PayeeItem);
      this.store.dispatch(actions.SetClosingStatementSettings({ payeeItems: this.payeeItems }));
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.store.dispatch(actions.ResetClosingStatementSettingsList());
  }

  onGridReady(gridApi: GridApi) {
    super.gridReady(gridApi);
    this.payees$.pipe(
      filter(items => !!items),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(items => {
      const payeeItems = items;
      if (!(gridApi.getRenderedNodes()?.length)) {
        this.gridApi.setGridOption('rowData', payeeItems);
      }
      this.payeeItems = payeeItems;
    });
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  private addressIsValid(item: PayeeItem) {
    return item.addressLinkId>0 || item.isElectronicEnabled || !item.willReceiveCS;
  }

  private emailIsValid(item: PayeeItem) {
   return item.emailId>0 || !item.isElectronicEnabled;
  }

  private templateIsValid(item: PayeeItem) {
    return item.documentTemplateId>0 || !item.willReceiveCS;
  }

  private isValidPayeeItem(item: PayeeItem) {
    return this.templateIsValid(item)
      && this.addressIsValid(item)
      && this.emailIsValid(item);
  }

  private isAllValid(items: PayeeItem[]): boolean {
    let oneIsSelected = false;
    let allAreValid = true;
    items.forEach(item => {
      if (!this.isValidPayeeItem(item)) allAreValid = false;
      else if (item.willReceiveCS) oneIsSelected = true;
    });
    return allAreValid && oneIsSelected;
  }

  private payeeEvaluation(item: PayeeItem, evaluation: ((item: PayeeItem) => boolean)): ((data) => boolean) {
    return _ => evaluation(item);
  }

  private getValidationParams(isValid: ((item: PayeeItem) => boolean)): IGridHeaderValidationStatusParams {
    return {
      getStatus: () => this.payees$.pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
        map(items => (items.every(item => isValid(item)) ? ValidationStatus.Ok : ValidationStatus.Error)),
      ),
    };
  }

  private onCellValueChanged(event: CellValueChangedEvent): void {
    const item = event.data as PayeeItem;
    const colId = event.column.getColId();
    switch (colId) {
      case 'emailId': {
        const emailsById = this.emailsByEntity.getValue(Email.getEmailId(item.destinationEntityTypeId, item.destinationEntityId));
        if (emailsById && emailsById.length > 0) {
          item.email = emailsById.find(v => v.id === item.emailId);
        }
        break;
      }
      case 'addressLinkId': {
        const addressesById = this.addressesByEntity.getValue(Address.getAddressId(item.destinationEntityTypeId, item.destinationEntityId));
        if (addressesById && addressesById.length > 0) {
          item.addressLink = addressesById.find(v => v.id === item.addressLinkId);
        }
        break;
      }
      case 'documentTemplateId': {
        item.documentTemplate = this.templates.find(v => v.id === item.documentTemplateId);
        break;
      }
    }

    this.payeeItems = this.gridApi.getRenderedNodes().map(node => node.data as PayeeItem);
    this.store.dispatch(actions.SetClosingStatementSettings({ payeeItems: this.payeeItems }));
  }

  public onSave() {
    this.store.dispatch(actions.UpdateClosingStatementSettingsRequest({ ledgerId: this.ledgerId, documentDeliveries: this.payeeItems }));
  }

  private onTaggedNameCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const data = params.data as PayeeItem;
    const isPrimary = data.isPrimaryContact;
    const renderer = {
      component: 'textTagRenderer',
      params: {
        value: params.value,
        tagType: isPrimary ? 'check' : null,
        tagTitle: 'Primary Contact',
      },
    };
    return renderer;
  }

  private onAddressCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const payee = params.data as PayeeItem;
    const addressesById = this.addressesByEntity.getValue(Address.getAddressId(payee.destinationEntityTypeId, payee.destinationEntityId));
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: addressesById ? SelectHelper.toOptions(addressesById, item => item.id, item => this.addressPipe.transform(item)) : [],
        value: params.value,
        placeholder: 'Select Address',
        disabledPlaceholder: false,
        withTag: true,
        isPrimary: this.payeeEvaluation(payee, _ => addressesById?.find(v => v.id === payee.addressLinkId)?.isPrimary),
        isValid: this.payeeEvaluation(payee, this.addressIsValid),
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private onEmailCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const payee = params.data as PayeeItem;
    const emailsById = this.emailsByEntity.getValue(Email.getEmailId(payee.destinationEntityTypeId, payee.destinationEntityId));
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: emailsById ? SelectHelper.toOptions(emailsById, item => item.id, item => item.email) : [],
        value: params.value,
        placeholder: 'Select Email',
        disabledPlaceholder: false,
        withTag: true,
        isPrimary: this.payeeEvaluation(payee, _ => emailsById?.find(v => v.id === payee.emailId)?.isPrimary),
        isValid: this.payeeEvaluation(payee, this.emailIsValid),
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private onTemplateCellRendererSelect(params: ICellRendererParams): CellRendererSelectorResult {
    const groups = this.templates.some(template => template.group === SelectGroupsEnum.ProjectSpecificTemplates)
      ? [SelectGroupsEnum.ProjectSpecificTemplates, SelectGroupsEnum.GlobalTemplates]
      : [SelectGroupsEnum.GlobalTemplates];

    const payee = params.data as PayeeItem;
    const comboBox = {
      component: 'dropdownRenderer',
      params: {
        values: this.templates,
        value: params.value,
        placeholder: 'Select Template',
        disabledPlaceholder: true,
        withTag: true,
        groups,
        isValid: this.payeeEvaluation(payee, this.templateIsValid),
      } as IDropdownEditorRendererParams,
    };
    return comboBox;
  }

  private loadAddresses(entityPairs: EntityPair[]) {
    this.store.dispatch(actions.GetClosingStatementSettingsAddressesRequest({ entityPairs }));
  }

  private loadEmails(entityPairs: EntityPair[]) {
    this.store.dispatch(actions.GetClosingStatementSettingsEmailsRequest({ entityPairs }));
  }

  public onClose(): void {
    this.modal.hide();
  }
}
