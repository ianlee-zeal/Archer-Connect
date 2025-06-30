/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { SavedSearch } from '@app/models/saved-search';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Observable } from 'rxjs';
import { ClaimSettlementLedgerEntryStatus, ClientWorkflowAdvancedSearchKey, LienPaymentStage, ProductCategory } from '@app/models/enums';
import { BankruptcyStage } from '@app/models/enums/bankruptcy-stage.enum';
import { ChartOfAccountId } from '@app/models/enums/chart-of-account-id.enum';


const defaultSearchState = new SearchState();
defaultSearchState.additionalFields = [];

const defaultSearchField = new SearchField();

const searchParams: SearchState[] = [
  {
    ...defaultSearchState,
    condition: SC.GreaterThan,
    field: { ...defaultSearchField, key: 'amount' },
    term: '0',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Contains,
    field: { ...defaultSearchField, key: 'accountId' },
    term: [
      ChartOfAccountId.GovtMedLienMedicare51060,
      ChartOfAccountId.GovtMedLienMedicareGlobal,
    ].join(', '),
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Equals,
    field: { ...defaultSearchField, key: 'transferToSubAccount' },
    term: 'true',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Contains,
    field: { ...defaultSearchField, key: 'statusId' },
    term: ClaimSettlementLedgerEntryStatus.PaymentAuthorized.toString(),
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Contains,
    field: { ...defaultSearchField, key: 'lienPaymentStageId' },
    term: LienPaymentStage.PendingLienResolution.toString(),
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    field: { ...defaultSearchField, key: 'clientWorkflow' },
    condition: null,
    additionalFields: [
      {
        field: { ...defaultSearchField, key: ClientWorkflowAdvancedSearchKey.ProductCategory },
        condition: SC.Equals,
        term: ProductCategory.Bankruptcy,
        additionalInfo: {
          isChecboxChecked: true,
        },
        isAllOptionsSelected: false,
        options: []
      },
      {
        field: { ...defaultSearchField, key: ClientWorkflowAdvancedSearchKey.Stage },
        condition: SC.Contains,
        term: BankruptcyStage.Finalized.toString(),
        additionalInfo: null,
        isAllOptionsSelected: false,
        options: []
      },
      {
        field: { ...defaultSearchField, key: ClientWorkflowAdvancedSearchKey.AgeOfStage },
        condition: SC.GreaterThan,
        term: null,
        additionalInfo: null,
        isAllOptionsSelected: false,
        options: []
      },
    ],
    errors: {
      condition: {
        required: true,
      },
    },
  },
];

export function getMedicareLiensToTransferSearch(
  searchFields: SearchField[],
  accounts$: Observable<SelectOption[]>,
  ledgerEntryStatuses$: Observable<SelectOption[]>,
  lienPaymentStages$: Observable<SelectOption[]>,
  bankruptcyStages: SelectOption[],
  productCategories: SelectOption[],
): SavedSearch {
  const searchParamsLocalCopy = JSON.parse(JSON.stringify(searchParams));

  const updatedSearchParams = searchParamsLocalCopy.map((param: SearchState) => {
    const searchField = searchFields.find((sf: SearchField) => sf.key === param.field.key);
    const updatedField = { ...searchField, options: null };

    if (updatedField.key === 'accountId') {
      updatedField.options = accounts$;
    } else if (updatedField.key === 'statusId') {
      updatedField.options = ledgerEntryStatuses$;
    } else if (updatedField.key === 'lienPaymentStageId') {
      updatedField.options = lienPaymentStages$;
    }

    param.field = updatedField;

    param.additionalFields = param.additionalFields.map((additionalField: SearchState) => {
      const searchFieldF = searchField?.additionalFieldKeys?.find((sf: SearchField) => sf.key === additionalField.field.key);
      const updatedAdditionalField = { ...additionalField, field: searchFieldF, options: null, isAllOptionsSelected: false, errors: {} };

      if (updatedAdditionalField.field?.key === ClientWorkflowAdvancedSearchKey.Stage) {
        const productCategory = param.additionalFields.find((af: SearchState) => af.field?.key === ClientWorkflowAdvancedSearchKey.ProductCategory);
        if (productCategory?.term === ProductCategory.Bankruptcy) {
          updatedAdditionalField.options = bankruptcyStages;
        }
      } else if (updatedAdditionalField.field?.key === ClientWorkflowAdvancedSearchKey.ProductCategory) {
        updatedAdditionalField.options = productCategories;
      }

      return updatedAdditionalField;
    });

    return param;
  });

  const savedSearchModel = new SavedSearch();
  savedSearchModel.searchModel = updatedSearchParams;
  return savedSearchModel;
}