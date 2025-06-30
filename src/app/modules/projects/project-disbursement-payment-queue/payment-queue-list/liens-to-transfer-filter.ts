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

const searchParams: any[] = [
  {
    ...defaultSearchState,
    condition: SC.GreaterThan,
    field: {
      key: 'amount',
    },
    term: '0',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Contains,
    field: {
      key: 'accountId',
    },
    term: `${ChartOfAccountId.PLRPLien51020},
            ${ChartOfAccountId.PLRPLienNonArcher51030},
            ${ChartOfAccountId.Rawlings51040},
            ${ChartOfAccountId.GovtMedLienMedicaid51050},
            ${ChartOfAccountId.MedicareSetAsideMSA51065},
            ${ChartOfAccountId.GovtMedLienMilitary51070},
            ${ChartOfAccountId.LienResFeeNonArcher51080},
            ${ChartOfAccountId.PrivateNonPLRP51090}`,
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Equals,
    field: {
      key: 'transferToSubAccount',
    },
    term: 'true',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Contains,
    field: {
      key: 'statusId',
    },
    term: ClaimSettlementLedgerEntryStatus.PaymentAuthorized.toString(),
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Contains,
    field: {
      key: 'lienPaymentStageId',
    },
    term: LienPaymentStage.PendingLienResolution.toString(),
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    field: {
      key: 'clientWorkflow',
    },
    condition: null,
    additionalFields: [
      {
        field: {
          key: ClientWorkflowAdvancedSearchKey.ProductCategory,
        },
        condition: SC.Equals,
        term: ProductCategory.Bankruptcy,
        additionalInfo: {
          isChecboxChecked: true,
        },
      },
      {
        field: {
          key: ClientWorkflowAdvancedSearchKey.Stage,
        },
        condition: SC.Contains,
        term: BankruptcyStage.Finalized.toString(),
      },
      {
        field: {
          key: ClientWorkflowAdvancedSearchKey.AgeOfStage,
        },
        condition: SC.GreaterThan,
        term: null,
      },
    ],
    errors: {
      condition: {
        required: true,
      },
    },
  },
];

export function getLiensToTransferSearch(
  searchFields: SearchField[],
  accounts$: Observable<SelectOption[]>,
  ledgerEntryStatuses$: Observable<SelectOption[]>,
  lienPaymentStages$: Observable<SelectOption[]>,
  bankruptcyStages: SelectOption[],
  productCategories: SelectOption[],
): SavedSearch {
  const searchParamsLocalCopy = JSON.parse(JSON.stringify(searchParams)); // we dont want to change searchParams. We do make a copy because of that
  const updatedSearchParams = searchParamsLocalCopy.map((param: SearchState) => {
    const searchField = searchFields.find((sf: SearchField) => sf.key === param.field.key);
    param.field = searchField;
    param.field.options = null;
    if (param.field.key === 'accountId') {
      param.field.options = accounts$;
    } else if (param.field.key === 'statusId') {
      param.field.options = ledgerEntryStatuses$;
    } else if (param.field.key === 'lienPaymentStageId') {
      param.field.options = lienPaymentStages$;
    }

    param.field.additionalFieldKeys?.forEach((additionalFieldKey: SearchField): void => {
      additionalFieldKey.options = null;
    });

    param.additionalFields?.forEach((additionalField: SearchState, index: number, array: SearchState[]): void => {
      additionalField.options = null;

      const searchFieldF = searchField.additionalFieldKeys?.find((sf: SearchField) => sf.key === additionalField.field.key);
      additionalField.field = searchFieldF;

      if (additionalField.field != null) {
        additionalField.field.options = null;
        if (additionalField.field.key === ClientWorkflowAdvancedSearchKey.Stage) {
          const productCategory = array.find((af: SearchState) => af.field?.key === ClientWorkflowAdvancedSearchKey.ProductCategory);
          if (productCategory?.term == ProductCategory.Bankruptcy) {
            additionalField.options = bankruptcyStages;
          }
        }
        if (additionalField.field.key === ClientWorkflowAdvancedSearchKey.ProductCategory) {
          additionalField.options = productCategories;
        }
      }

      additionalField.isAllOptionsSelected = false;
      additionalField.errors = {};
    });

    return param;
  });

  const savedSearchModel = new SavedSearch();
  savedSearchModel.searchModel = updatedSearchParams;
  return savedSearchModel;
}
