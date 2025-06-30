import { IdValue } from '@app/models';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { BillingRuleTemplateDto } from '@app/models/billing-rule/billing-rule-template-dto';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const featureName = '[Billing Rule Templates]';

export const Error = createAction(`${featureName} Error`, props<{ error: any }>());

export const GetBillingRuleTemplateStatuses = createAction(`${featureName} Get BRT Statuses`);
export const GetBillingRuleTemplateStatusesSuccess = createAction(`${featureName} Get BRT Statuses Success`, props<{ statuses: IdValue[] }>());

export const SearchInvoicingItems = createAction(`${featureName} Get Invoice Items`, props<{ searchTerm: string }>());
export const SearchInvoicingItemsSuccess = createAction(`${featureName} Get Invoice Items Success`, props<{ items: IdValue[] }>());

export const SearchRevRecItems = createAction(`${featureName} Search Rev Rec Items`, props<{ searchTerm: string }>());
export const SearchRevRecItemsSuccess = createAction(`${featureName} Search Rev Rec Items Success`, props<{ items: IdValue[] }>());

export const GetRevRecMethods = createAction(`${featureName} Get Rev Rec Methods`);
export const GetRevRecMethodsSuccess = createAction(`${featureName} Get Rev Rec Methods Success`, props<{ methods: IdValue[] }>());

export const GetBillingRuleTemplate = createAction(`${featureName} Get Billing Rule Template`, props<{ id: number }>());
export const GetBillingRuleTemplateSuccess = createAction(`${featureName} Get Billing Rule Template Success`, props<{ billingRuleTemplate: BillingRuleTemplate }>());

export const CreateBillingRuleTemplate = createAction(`${featureName} Create Billing Rule Template`, props<{ dto: BillingRuleTemplateDto }>());
export const CreateBillingRuleTemplateSuccess = createAction(`${featureName} Create Billing Rule Template Success`, props<{ billingRuleTemplate: BillingRuleTemplate }>());

export const UpdateBillingRuleTemplate = createAction(`${featureName} Update Billing Rule Template`, props<{ dto: BillingRuleTemplateDto }>());
export const UpdateBillingRuleTemplateSuccess = createAction(`${featureName} Update Billing Rule Template Success`, props<{ billingRuleTemplate: BillingRuleTemplate }>());

export const DeleteBillingRuleTemplate = createAction(`${featureName} Delete Billing Rule Template`, props<{ id: number }>());
export const DeleteBillingRuleTemplateSuccess = createAction(`${featureName} Delete Billing Rule Template Success`);

export const GoToBillingRuleTemplateList = createAction(`${featureName} Go To Billing Rule Template List`);
export const GoToBillingRuleTemplate = createAction(`${featureName} Go To Billing Rule Template`, props<{ billingRuleTemplateId: number }>());

export const ClearBillingRuleTemplate = createAction(`${featureName} Clear Billing Rule Template`);

export const SearchBillingRuleTemplates = createAction(`${featureName} Search Billing Rule Templates`, props<{ gridParams: IServerSideGetRowsParamsExtended }>());
export const SearchBillingRuleTemplatesSuccess = createAction(`${featureName} Search Billing Rule Templates Success`);

export const RefreshBillingRuleTemplates = createAction(`${featureName} Refresh Billing Rule Templates`);

export const GetFeeScopes = createAction(`${featureName} Get Billing Rule Template Fee Scopes`);
export const GetFeeScopesSuccess = createAction(`${featureName} Get Billing Rule Template Fee Scopes Success`, props<{ feeScopes: IdValue[] }>());

export const GetChartOfAccounts = createAction(`${featureName} Get Billing Rule Template Chart Of Accounts`);
export const GetChartOfAccountsSuccess = createAction(`${featureName} Get Billing Rule Template Chart Of Accounts Success`, props<{ chartOfAccounts: IdValue[] }>());
