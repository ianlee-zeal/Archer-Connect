/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { SavedSearch } from '@app/models/saved-search';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Observable } from 'rxjs';
import { ClientWorkflowAdvancedSearchKey, ProductCategory } from '@app/models/enums';
import { BankruptcyStage } from '@app/models/enums/bankruptcy-stage.enum';
import { OverallInvoiceApprovalStatus, overallInvoiceApprovalStatusOptions } from '@app/models/enums/overall-invoice-approval-status.enum';
import { environment } from '../../../../../environments/environment';

const defaultSearchState = new SearchState();
defaultSearchState.additionalFields = [];

const searchParams: any[] = [
  {
    ...defaultSearchState,
    condition: SC.Contains,
    field: {
      key: 'accountGroupId',
    },
    term: '52',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Equals,
    field: {
      key: 'coaFeePaymentSweepEnabled',
    },
    term: 'true',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    field: {
      key: 'overallInvoiceApprovalStatusId',
    },
    condition: SC.Contains,
    term: OverallInvoiceApprovalStatus.ReadyToInvoice.toString(),
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
  {
    ...defaultSearchState,
    condition: SC.Contains,
    field: {
      key: 'holdTypeReason.holdTypeReasonId',
    },
    term: '',
    additionalFields: [],
    additionalInfo: {
      isChecboxChecked: true,
    },
  },
  {
    ...defaultSearchState,
    condition: SC.Equals,
    field: {
      key: 'lienResolutionFeeFinal',
    },
    term: 'true',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Equals,
    field: {
      key: 'probateFeeFinal',
    },
    term: 'true',
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Equals,
    field: {
      key: 'payeeName',
    },
    term: environment.master_org_name,
    additionalFields: [],
  },
  {
    ...defaultSearchState,
    condition: SC.Equals,
    field: {
      key: 'claimantStatus',
    },
    term: 'Active',
    additionalFields: [],
  },
];

export function getReadyToInvoiceFeesSavedSearch(
  searchFields: SearchField[],
  accountGroups$: Observable<SelectOption[]>,
  ledgerFirmApprovedStatuses: SelectOption[],
  holdTypeReasons: SelectOption[],
  bankruptcyStages: SelectOption[],
  productCategories: SelectOption[],
): SavedSearch {
  const searchParamsLocalCopy = JSON.parse(JSON.stringify(searchParams)); // we dont want to change searchParams. We do make a copy because of that
  const updatedSearchParams = searchParamsLocalCopy.map((param: SearchState) => {
    const searchField = searchFields.find((sf: SearchField) => sf.key === param.field.key);
    param.field = searchField;
    param.field.options = null;
    if (param.field.key === 'accountGroupId') {
      param.field.options = accountGroups$;
    } else if (param.field.key === 'ledgerFirmApprovedStatusId') {
      param.field.options = ledgerFirmApprovedStatuses;
    } else if (param.field.key === 'holdTypeReason.holdTypeReasonId') {
      param.field.options = holdTypeReasons;
    } else if (param.field.key === 'overallInvoiceApprovalStatusId') {
      param.field.options = overallInvoiceApprovalStatusOptions;
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
