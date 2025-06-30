/* eslint-disable no-param-reassign */
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SearchState } from '@app/models/advanced-search/search-state';
import { ChartOfAccountGroupEnum } from '@app/models/enums/chart-of-account-group.enum';
import { OverallInvoiceApprovalStatus, overallInvoiceApprovalStatusOptions } from '@app/models/enums/overall-invoice-approval-status.enum';
import { SavedSearch } from '@app/models/saved-search';
import { Observable } from 'rxjs';
import { SelectOption } from '../shared/_abstractions/base-select';

const defaultSearchState = new SearchState();
defaultSearchState.additionalFields = [];

function getSearchFields(): any[] {
  return [
    {
      ...defaultSearchState,
      field: {
        key: 'accountGroupId',
      },
      condition: SC.Contains,
      term: [ChartOfAccountGroupEnum.ARCHERFeesGroup].join(','),
      additionalFields: [],
    },
    {
      ...defaultSearchState,
      field: {
        key: 'coaFeePaymentSweepEnabled',
      },
      condition: SC.Equals,
      term: true,
      additionalFields: [],
    },
    {
      ...defaultSearchState,
      field: {
        key: 'overallInvoiceApprovalStatusId',
      },
      condition: SC.Contains,
      term: [OverallInvoiceApprovalStatus.NoApprovals, OverallInvoiceApprovalStatus.QSFAdminApproved].join(','),
      additionalFields: [],
    },
    {
      ...defaultSearchState,
      condition: SC.Equals,
      field: {
        key: 'payeeName',
      },
      term: 'Archer Systems, LLC',
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
        key: 'holdTypeReason.holdTypeReasonId',
      },
      term: '',
      additionalFields: [],
      additionalInfo: {
        isChecboxChecked: true,
      },
    },
  ];
}

export function getReviewAllArcherFeesSavedSearch(
  searchFields: SearchField[],
  coaGroupNumbers$: Observable<SelectOption[]>,
): SavedSearch {
  const searchParams = getSearchFields();
  const updatedSearchParams = searchParams.map((param: SearchState) => {
    const searchField = searchFields.find((sf: SearchField) => sf.key === param.field.key);
    const term = param.term;
    param.field = searchField;
    param.term = term;
    param.field.options = null;

    if (param.field.key === 'accountGroupId') {
      param.field.options = coaGroupNumbers$;
    }

    if (param.field.key === 'overallInvoiceApprovalStatusId') {
      param.field.options = overallInvoiceApprovalStatusOptions;
    }

    if (param.field.key === 'claimantStatus') {
      param.field.options =  [
        { id: 'Active', name: 'Active' },
        { id: 'Inactive', name: 'Inactive' }
      ];
    }

    return param;
  });

  const savedSearchModel = new SavedSearch();
  savedSearchModel.searchModel = updatedSearchParams;
  return savedSearchModel;
}
