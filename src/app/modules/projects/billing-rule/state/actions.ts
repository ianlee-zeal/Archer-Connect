import { IdValue, Org, InjuryCategory } from '@app/models';
import { BillingRule } from '@app/models/billing-rule/billing-rule';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { FeeCap } from '@app/models/billing-rule/fee-cap';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const featureName = '[Billing Rules]';

export const Error = createAction(`${featureName} Error`, props<{ error: any }>());

export const GetFeeScopes = createAction(`${featureName} Get BR Fee Scopes`);
export const GetFeeScopesSuccess = createAction(`${featureName} Get BR Fee Scopes Success`, props<{ feeScopes: IdValue[] }>());

export const GetRevRecMethods = createAction(`${featureName} Get Rev Rec Methods`);
export const GetRevRecMethodsSuccess = createAction(`${featureName} Get Rev Rec Methods Success`, props<{ methods: IdValue[] }>());

export const GetBillingRule = createAction(`${featureName} Get Billing Rule`, props<{ id: number }>());
export const GetBillingRuleSuccess = createAction(`${featureName} Get Billing Rule Success`, props<{ billingRule: BillingRule }>());

export const CreateBillingRule = createAction(`${featureName} Create Billing Rule`, props<{ dto: any }>());
export const CreateBillingRuleSuccess = createAction(`${featureName} Create Billing Rule Success`, props<{ billingRule: BillingRule }>());

export const GetProjectQsfOrg = createAction(`${featureName} Get Project Qsf Org`, props<{ projectId: number }>());
export const GetProjectQsfOrgSuccess = createAction(`${featureName} Get Project Qsf Org Success`, props<{ projectQsfOrg: Org }>());

export const UpdateBillingRule = createAction(`${featureName} Update Billing Rule`, props<{ dto: any }>());
export const UpdateBillingRuleSuccess = createAction(`${featureName} Update Billing Rule Success`, props<{ billingRule: BillingRule }>());

export const DeleteBillingRule = createAction(`${featureName} Delete Billing Rule`, props<{ id: number }>());
export const DeleteBillingRuleSuccess = createAction(`${featureName} Delete Billing Rule Success`);

export const ClearBillingRule = createAction(`${featureName} Clear Billing Rule`);

export const SearchBillingRules = createAction(`${featureName} Search Billing Rules`, props<{ gridParams: IServerSideGetRowsParamsExtended, projectId: number }>());
export const SearchBillingRulesSuccess = createAction(`${featureName} Search Billing Rules Success`, props<{ totalRecordsCount: number }>());

export const RefreshBillingRules = createAction(`${featureName} Refresh Billing Rules`);

export const SearchBillingRuleTemplates = createAction(`${featureName} Search Billing Rule Templates`, props<{ brtName: string }>());
export const SearchBillingRuleTemplatesSuccess = createAction(`${featureName} Search Billing Rule Templates Success`, props<{ billingRuleTemplates: BillingRuleTemplate[] }>());

export const SearchOrgs = createAction(`${featureName} Search Orgs`, props<{ orgName: string }>());
export const SearchOrgsSuccess = createAction(`${featureName} Search Orgs Success`, props<{ orgs: Org[] }>());

export const SearchInjuryCategories = createAction(`${featureName} Get Injury Categories`, props<{ term: string }>());
export const SearchInjuryCategoriesSuccess = createAction(`${featureName} Get Injury Categories Success`, props<{ injuryCategories: InjuryCategory[] }>());

export const SearchFeeCaps = createAction(`${featureName} Search Fee Caps`, props<{ feeCapsGridParams: IServerSideGetRowsParamsExtended }>());
export const SearchFeeCapsSuccess = createAction(`${featureName} Search Fee Caps Success`);

export const RefreshFeeCaps = createAction(`${featureName} Refresh Fee Caps`);
// export const GetFeeCap = createAction(`${featureName} Get Fee Cap`, props<{ id: number }>());
// export const GetFeeCapSuccess = createAction(`${featureName} Get Fee Cap Success`, props<{ feeCap: FeeCap }>());

export const CreateFeeCap = createAction(`${featureName} Create Fee Cap`, props<{ dto: any }>());
export const CreateFeeCapSuccess = createAction(`${featureName} Create Fee Cap Success`, props<{ feeCap: FeeCap }>());

export const UpdateFeeCap = createAction(`${featureName} Update Fee Cap`, props<{ dto: any }>());
export const UpdateFeeCapSuccess = createAction(`${featureName} Update Fee Cap Success`, props<{ feeCap: FeeCap }>());

export const GetChartOfAccounts = createAction(`${featureName} Get BR Chart of Accounts`);
export const GetChartOfAccountsSuccess = createAction(`${featureName} Get BR Chart of Accounts Success`, props<{ chartOfAccounts: IdValue[] }>());
