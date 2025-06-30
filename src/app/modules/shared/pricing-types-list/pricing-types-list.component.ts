import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { IdValue, InjuryCategory } from '@app/models';
import { GridId } from '@app/models/enums/grid-id.enum';
import { CellValueChangedEvent, EditableCallbackParams, GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { ListView } from '@app/modules/shared/_abstractions/list-view';

import {
  RangeEditorRendererComponent, DropdownEditorRendererComponent,MultiselectDropdownEditorRendererComponent,
  TextboxEditorRendererComponent, TextboxEditorRendererDataType } from '@app/modules/shared/_renderers';

import * as fromShared from '@app/state';
import { InjuryCategoryTitlePipe } from '@app/modules/shared/_pipes';
import { VariablePricingType } from '@app/models/enums/billing-rule/variable-pricing-type';
import { VariablePricingFormValue } from '@app/modules/shared/variable-pricing-form/variable-pricing-form.component';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { outcomeBasedPricingSelectors } from '../state/outcome-based-pricing/selectors';
import * as actions from '../state/outcome-based-pricing/actions';
import { PricingTypesActionsRendererComponent } from './pricing-types-actions-renderer/pricing-types-actions-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-pricing-types-list',
  templateUrl: './pricing-types-list.component.html',
  styleUrls: ['./pricing-types-list.component.scss'],
})
export class PricingTypesListComponent extends ListView implements OnInit, OnChanges {
  @Input() public gridId: GridId = GridId.OutcomeBasedPricingList;
  @Input() public relatedServices: any[];
  @Input() public tortId: number;
  @Input() public canEdit;
  @Input() public variablePricing: VariablePricingFormValue;
  @Output() public variablePricingChange = new EventEmitter<VariablePricingFormValue>();

  public injuryCategories$ = this.store.select(outcomeBasedPricingSelectors.injuryCategories);
  public variablePricingTypes$ = this.store.select(outcomeBasedPricingSelectors.variablePricingTypes);

  public items = [];
  public pricingTypes: IdValue[] = [];
  public injureCategories: InjuryCategory[] = [];
  private readonly decimalsCount = 10;

  private readonly variablePricingTypeId = 'variablePricingTypeId';
  private readonly rangeValue = 'rangeValue';
  private readonly tierPrice = 'tierPrice';
  private readonly injuryCategoryIds = 'injuryCategoryIds';
  private readonly percentageOfSavings = 'percentageOfSavings';

  constructor(
    private injuryCategoryTitlePipe: InjuryCategoryTitlePipe,
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef) {
    super(router, elementRef);
  }

  public get hasRows() {
    return this.variablePricing && (this.variablePricing.slidingScalePricings?.length > 0
    || this.variablePricing.tieredPricings?.length > 0
    || this.variablePricing.percentageOfSavingsPricings?.length > 0);
  }

  public readonly gridOptions: GridOptions = {
    getRowId: (data: any): string => `${data?.data?.id?.toString()}`,
    columnDefs: [
      {
        headerName: 'Variable Pricing Type',
        field: this.variablePricingTypeId,
        sortable: true,
        cellRendererSelector: params => (
          this.canEdit
            ? AGGridHelper.getDropdownRenderer({
              values: this.pricingTypes,
              value: params.value,
              placeholder: 'Select Pricing Type',
              disabledPlaceholder: true,
            })
            : AGGridHelper.getTextBoxRenderer({
              value: this.pricingTypes.find(value => value.id === params.value).name,
              type: TextboxEditorRendererDataType.Text,
            })
        ),
        editable: () => this.canEdit,
        cellClass: () => this.getEditableClass(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Range',
        field: this.rangeValue,
        sortable: true,
        editable: (params: EditableCallbackParams) => {
          const { variablePricingTypeId } = params.data;
          return this.canEdit && variablePricingTypeId && variablePricingTypeId !== VariablePricingType.PercentageOfSavings;
        },
        cellClass: () => this.getEditableClass(),
        ...AGGridHelper.nameColumnDefaultParams,
        cellRendererSelector: params => {
          const { lowerValue, upperValue } = params.data;
          return AGGridHelper.getRangeRenderer({ lowerValue: lowerValue || '0', upperValue: upperValue || '0' });
        },
      },
      {
        headerName: 'Tier Price',
        field: this.tierPrice,
        sortable: true,
        editable: (params: EditableCallbackParams) => {
          const { variablePricingTypeId } = params.data;
          return this.canEdit && variablePricingTypeId && variablePricingTypeId !== VariablePricingType.PercentageOfSavings;
        },
        cellClass: () => this.getEditableClass(),
        ...AGGridHelper.nameColumnDefaultParams,
        cellRendererSelector: params => AGGridHelper.getTextBoxRenderer({
          value: params.value,
          type: TextboxEditorRendererDataType.Decimal,
        }),
        onCellValueChanged: val => console.log(val)
      },
      {
        headerName: 'Injury Categories',
        field: this.injuryCategoryIds,
        sortable: true,
        editable: (params: EditableCallbackParams) => {
          const { variablePricingTypeId } = params.data;
          return this.canEdit
          && variablePricingTypeId
          && variablePricingTypeId !== VariablePricingType.PercentageOfSavings
          && variablePricingTypeId !== VariablePricingType.TieredPrice;
        },
        cellClass: () => this.getEditableClass(),
        cellRendererSelector: params => (this.canEdit
          ? AGGridHelper.getMultiselectDropdownEditorRenderer({
            options: this.injureCategories.map(category => ({
              ...category,
              name: this.injuryCategoryTitlePipe.transform(category)
            })),
            values: params.value,
            placeholder: 'Select Injury Categories'
          })
          : AGGridHelper.getTextBoxRenderer({
            value: this.injureCategories
              ?.filter(category => params.value?.includes(category.id))
              .map(category => this.injuryCategoryTitlePipe.transform(category))
              .join(', '),
            type: TextboxEditorRendererDataType.Text,
          })
        ),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Percentage of Savings',
        field: this.percentageOfSavings,
        sortable: true,
        editable: (params: EditableCallbackParams) => {
          const { variablePricingTypeId } = params.data;
          return this.canEdit && variablePricingTypeId === VariablePricingType.PercentageOfSavings;
        },
        cellClass: () => this.getEditableClass(),
        cellRendererSelector: params => (
          params.data.variablePricingTypeId === VariablePricingType.PercentageOfSavings
          ? AGGridHelper.getTextBoxRenderer({
            value: params.value || 0,
            type: TextboxEditorRendererDataType.Percentage,
            decimalsCount: this.decimalsCount,
          })
          : ''
        ),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      AGGridHelper.getActionsColumn({
        deleteHandler: this.onDeleteHandler.bind(this),
        hidden: this.isDeleteButtonHidden.bind(this),
      }),

    ],

    suppressClickEdit: true,
    suppressRowClickSelection: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onCellValueChanged: this.onCellValueChanged.bind(this),
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      suppressKeyboardEvent: this.suppressDefaultKeyboardKeys.bind(this),
    },
    components: {
      buttonRenderer: PricingTypesActionsRendererComponent,
      textBoxRenderer: TextboxEditorRendererComponent,
      dropdownRenderer: DropdownEditorRendererComponent,
      multiselectDropdownEditorRenderer: MultiselectDropdownEditorRendererComponent,
      rangeEditorRenderer: RangeEditorRendererComponent,
    },
  } as GridOptions;

  ngOnChanges(changes: SimpleChanges): void {
    const { relatedServices, variablePricing } = this;
    const relatedServicesStateChanges = changes[CommonHelper.nameOf({ relatedServices })];
    const variablePricingStateChanges = changes[CommonHelper.nameOf({ variablePricing })];

    if (relatedServices && relatedServicesStateChanges && this.gridApi) {
      const hideId = relatedServices[0]?.id === 0;
      const columns = this.gridApi.getColumnDefs();

      this.gridApi.setGridOption('columnDefs', columns.map(col => {
        if (col.headerName === 'ID') { return { ...col, hide: hideId }; }
        return col;
      }));

      this.gridApi.setGridOption('rowData', this.relatedServices);
    }

    if (variablePricingStateChanges && this.gridApi) {
      this.initRowData();
      this.gridApi.setGridOption('rowData', this.items);
    }

    this.toggleActionsColumn(!this.canEdit);
  }

  ngOnInit(): void {
    this.store.dispatch(actions.GetVariablePricingTypes());
    this.store.dispatch(actions.SearchInjuryCategories({ tortId: this.tortId }));

    this.injuryCategories$.pipe(
      filter(categories => !!categories),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(categories => {
      this.injureCategories = categories;
    });

    this.variablePricingTypes$.pipe(
      filter(types => !!types),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(types => {
      this.pricingTypes = types;
    });

    this.initRowData();
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.gridApi.setGridOption('rowData', this.items);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
  }

  private initRowData() {
    if (this.hasRows) {
      switch (this.variablePricing?.variablePricingTypeId) {
        case VariablePricingType.PercentageOfSavings:
          this.items = this.variablePricing.percentageOfSavingsPricings.map((value, ind) => ({
            id: ind,
            [this.variablePricingTypeId]: this.variablePricing.variablePricingTypeId,
            percentageOfSavings: value.percentageOfSavings,
          }));
          break;
        case VariablePricingType.SlidingScale:
          this.items = this.variablePricing.slidingScalePricings.map((value, ind) => ({
            id: ind,
            [this.variablePricingTypeId]: this.variablePricing.variablePricingTypeId,
            lowerValue: value.lowerValue || 0,
            upperValue: value.upperValue || 0,
            rangeValue: `${value.lowerValue} - ${value.upperValue}`,
            tierPrice: value.tierPrice || 0,
            priceType: PriceType.Amount,
            injuryCategories: value.injuryCategories,
            injuryCategoryIds: value.injuryCategories?.map(category => category.id)
          }));

          break;
        case VariablePricingType.TieredPrice:
          this.items = this.variablePricing.tieredPricings.map((value, ind) => ({
            id: ind,
            [this.variablePricingTypeId]: this.variablePricing.variablePricingTypeId,
            lowerValue: value.lowerValue || 0,
            upperValue: value.upperValue || 0,
            rangeValue: `${value.lowerValue} - ${value.upperValue}`,
            tierPrice: value.tierPrice || 0,
            priceType: PriceType.Amount,
            injuryCategoryIds: [],
          }));
          break;
        default:
          break;
      }
    } else {
      this.items = [{ id: this.items.length, [this.variablePricingTypeId]: 0 }];
    }
  }

  private variablePricingChangeEmit(items) {
    let data = null;
    const variablePricingTypeId = items[0]?.variablePricingTypeId;

    switch (variablePricingTypeId) {
      case VariablePricingType.PercentageOfSavings:
        data = { ...this.variablePricing, variablePricingTypeId, percentageOfSavingsPricings: items };
        break;
      case VariablePricingType.SlidingScale:
        data = { ...this.variablePricing, variablePricingTypeId, slidingScalePricings: items };
        break;
      case VariablePricingType.TieredPrice:
        data = { ...this.variablePricing, variablePricingTypeId, tieredPricings: items };
        break;
    }

    this.variablePricingChange.emit(data);
  }

  private onCellValueChanged(event: CellValueChangedEvent): void {
    let updatedData;
    const rowData = event.data;
    const colId = event.column.getColId();

    switch (colId) {
      case this.variablePricingTypeId:
      {
        updatedData = this.items.map(item => ({
          ...item,
          [this.variablePricingTypeId]: event.value,
          lowerValue: 0,
          upperValue: 0,
          tierPrice: 0,
          injuryCategories: [],
          injuryCategoryIds: [],
          percentageOfSavings: 0,
          priceType: PriceType.Amount,
        }));
        break;
      }
      case this.rangeValue:
      {
        const [lowerValue, upperValue] = event.value.split('-');
        updatedData = this.items.map(item => {
          if (item.id === rowData.id) {
            return { ...item, lowerValue: Number(lowerValue), upperValue: Number(upperValue) };
          }
          return item;
        });
        break;
      }

      case this.tierPrice:
      {
        updatedData = this.items.map(item => {
          if (item.id === rowData.id) {
            return { ...item, [this.tierPrice]: Number(event.value) };
          }
          return item;
        });
        break;
      }

      case this.injuryCategoryIds: {
        updatedData = this.items.map(item => {
          if (item.id === rowData.id) {
            return {
              ...item,
              injuryCategoryIds: event.value,
              injuryCategories: this.injureCategories?.filter(value => event.value.includes(value.id))
            };
          }
          return item;
        });
        break;
      }

      case this.percentageOfSavings: {
        updatedData = this.items.map(item => {
          if (item.id === rowData.id) {
            return { ...item, [this.percentageOfSavings]: Number(event.value) };
          }
          return item;
        });
        break;
      }
    }

    this.variablePricingChangeEmit(updatedData);
  }

  public onAdd(): void {
    const newItem = {
      id: this.items.length,
      [this.variablePricingTypeId]: this.variablePricing.variablePricingTypeId,
      lowerValue: null,
      upperValue: null,
      tierPrice: null,
      injuryCategories: [],
      injuryCategoryIds: [],
      percentageOfSavings: null,
      priceType: PriceType.Amount,
    };

    switch (this.variablePricing?.variablePricingTypeId) {
      case VariablePricingType.PercentageOfSavings:
        this.variablePricing.percentageOfSavingsPricings.push(newItem);
        break;
      case VariablePricingType.SlidingScale:
        this.variablePricing.slidingScalePricings.push(newItem);
        break;
      case VariablePricingType.TieredPrice:
        this.variablePricing.tieredPricings.push(newItem);
        break;
    }

    this.items.push(newItem);
    this.gridApi.setGridOption('rowData', this.items);
    this.variablePricingChange.emit(this.variablePricing);
  }

  private onDeleteHandler({ id }): void {
    const items = this.items.filter(item => item.id !== id);
    this.gridApi.setGridOption('rowData', items);
    this.variablePricingChangeEmit(items);
  }

  private isDeleteButtonHidden(): boolean {
    return this.canEdit;
  }
}
