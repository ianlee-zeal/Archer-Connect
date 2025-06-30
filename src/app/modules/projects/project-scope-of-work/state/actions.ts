import { createAction, props } from '@ngrx/store';
import {
  ProjectProductCategory,
  ProjectProduct,
  ProductCondition,
  ProjectProductCondition,
} from '@app/models/scope-of-work';
import { IdValue } from '@app/models';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ProjectCopySettings } from '@app/models/scope-of-work/project-copy-settings';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export const featureName = '[Scope of Work]';

export const GetAllProductsAndConditions = createAction(
  `${featureName} Get All Products And Conditions`,
);
export const GetAllProductsAndConditionsSuccess = createAction(
  `${featureName} Get All Products And Conditions Success`,
  props<{ allProducts: ProjectProductCategory[]; allProductConditions: ProductCondition[] }>(),
);

export const GetProductCategories = createAction(
  `${featureName} Get Product Categories`,
  props<{ projectId: number; callback?:() => void }>(),
);
export const GetProductCategoriesSuccess = createAction(
  `${featureName} Get Product Categories Success`,
  props<{
    projectProductCategories: ProjectProductCategory[];
    projectProducts: ProjectProduct[];
    projectProductConditions: ProjectProductCondition[];
    productCategories: ProjectProductCategory[];
  }>(),
);

export const UpdateProductCategories = createAction(
  `${featureName} Update Product Categories`,
  props<{
    projectId: number;
    productCategories: ProjectProductCategory[];
    callback:() => void;
  }>(),
);
export const UpdateProductCategoriesSuccess = createAction(
  `${featureName} Update Product Categories Success`,
);

export const ResetProductCategories = createAction(
  `${featureName} Reset Product Categories`,
);

export const Error = createAction(
  `${featureName} Error`,
  props<{ error: any }>(),
);

// Projects light
export const GetProjectsLightList = createAction(
  `${featureName} Get Projects Light List`,
  props<{ params: Partial<IServerSideGetRowsRequestExtended> }>(),
);
export const GetProjectsLightListSuccess = createAction(
  `${featureName} Get Projects Light List Success`,
  props<{ projectsLight: IdValue[]; totalRecords: number }>(),
);

export const CopyProjectSettings = createAction(
  `${featureName} Copy Project Settings`,
  props<{
    projectId: string;
    formValues: ProjectCopySettings;
    callback:() => void;
  }>(),
);

export const CopyProjectSettingsSuccess = createAction(
  `${featureName} Copy Project Settings Success`,
  props<{ callback:() => void }>(),
);

export const GetProductScopeContactsList = createAction(`${featureName} Get Product Scope Contacts List`, props<{ projectId: number, agGridParams?: IServerSideGetRowsParamsExtended }>());
export const GetProductScopeContactsListSuccess = createAction(`${featureName} Get Product Scope Contacts List Success`, props<{ contacts: ProjectProductCategory[], totalRecords: number, agGridParams?: IServerSideGetRowsParamsExtended }>());
