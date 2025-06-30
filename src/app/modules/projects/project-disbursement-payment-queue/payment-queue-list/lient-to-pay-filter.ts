/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { SavedSearch } from '@app/models/saved-search';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Observable } from 'rxjs';
import { ClientWorkflowAdvancedSearchKey, LienPaymentStage, ProductCategory } from '@app/models/enums';
import { BankruptcyStage } from '@app/models/enums/bankruptcy-stage.enum';
import { LienResolutionStage } from '@app/models/enums/lien-resolution-stage.enum';
import { ChartOfAccountId } from '@app/models/enums/chart-of-account-id.enum';

const defaultSearchState = new SearchState();
defaultSearchState.additionalFields = [];
const liensToPayAccounts = [
  ChartOfAccountId.PLRPLien51020,
  ChartOfAccountId.PLRPLienNonArcher51030,
  ChartOfAccountId.Rawlings51040,
  ChartOfAccountId.GovtMedLienMedicaid51050,
  ChartOfAccountId.MedicareSetAsideMSA51065,
  ChartOfAccountId.GovtMedLienMilitary51070,
  ChartOfAccountId.LienResFeeNonArcher51080,
  ChartOfAccountId.PrivateNonPLRP51090,
  ChartOfAccountId.LienCredit51300,
];
const searchParams: any[] = [
  {
    ...defaultSearchState,
    condition: SC.NotEqual,
    field: {
      key: 'disbursementGroupName',
    },
    term: 'Provisional',
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
        term: ProductCategory.MedicalLiens,
      },
      {
        field: {
          key: ClientWorkflowAdvancedSearchKey.Stage,
        },
        condition: SC.Contains,
        term: `${LienResolutionStage.SystemFinalized},${LienResolutionStage.AgentFinalized}`,
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
  {
    ...defaultSearchState,
    field: {
      key: 'amount',
    },
    condition: SC.GreaterThan,
    term: '0',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    field: {
      key: 'accountId',
    },
    condition: SC.Contains,
    term: liensToPayAccounts.join(','),
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    field: {
      key: 'payableStatuses',
    },
    condition: SC.Equals,
    term: true,
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    field: {
      key: 'lienPaymentStageId',
    },
    condition: SC.Contains,
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
        term: null,
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

export function getLiensToPaySavedSearch(
  searchFields: SearchField[],
  lienPaymentStages$: Observable<SelectOption[]>,
  ledgerEntryStatuses$: Observable<SelectOption[]>,
  coaNumbers$: Observable<SelectOption[]>,
  stagesLien: SelectOption[],
  stagesBankruptcy: SelectOption[],
  productCategories: SelectOption[],
): SavedSearch {
  const updatedSearchParams = searchParams.map((param: SearchState) => {
    const searchField = searchFields.find((sf: SearchField) => sf.key === param.field.key);
    param.field = searchField;
    param.field.options = null;
    if (param.field.key === 'lienPaymentStageId') {
      param.field.options = lienPaymentStages$;
    } else if (param.field.key === 'statusId') {
      param.field.options = ledgerEntryStatuses$;
    } if (param.field.key === 'accountId') {
      param.field.options = coaNumbers$;
    }

    param.field.additionalFieldKeys?.forEach((additionalFieldKey: SearchField): void => {
      additionalFieldKey.options = null;
    });

    param.additionalFields?.forEach((additionalField: SearchState, index: number, array: SearchState[]): void => {
      additionalField.options = null;

      const searchFieldF = searchField.additionalFieldKeys?.find((sf: SearchField) => sf.key === additionalField.field.key);
      additionalField.field = searchFieldF;

      additionalField.field.options = null;
      if (additionalField.field.key === ClientWorkflowAdvancedSearchKey.Stage) {
        const productCategory = array.find((af: SearchState) => af.field.key === ClientWorkflowAdvancedSearchKey.ProductCategory);
        if (productCategory?.term == ProductCategory.MedicalLiens) {
          additionalField.options = stagesLien;
        }
        if (productCategory?.term == ProductCategory.Bankruptcy) {
          additionalField.options = stagesBankruptcy;
        }
      }

      if (additionalField.field.key === ClientWorkflowAdvancedSearchKey.ProductCategory) {
        additionalField.options = productCategories;
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
