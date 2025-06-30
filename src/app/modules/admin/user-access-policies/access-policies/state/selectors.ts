import { createSelector, createFeatureSelector } from '@ngrx/store';

import { EntityTypeCategoryEnum } from '@app/models/enums/entity-type-category.enum';
import * as fromAdminR from '../../../state/reducer';

const adminFeature = createFeatureSelector<fromAdminR.AdminState>('admin_feature');

const accessPolicies = createSelector(adminFeature, state => state.user_access_policies.accessPolicies);

export const accessPoliciesIndex = createSelector(accessPolicies, state => state.index);
export const accessPoliciesItem = createSelector(accessPolicies, state => state.item);
export const accessPoliciesHeader = createSelector(accessPolicies, state => state.itemHeader);
export const error = createSelector(accessPolicies, state => state.error);
export const entityTypes = createSelector(accessPolicies, state => state.entityTypes);

export const objectEntityTypes = createSelector(accessPolicies, state => state.entityTypes
    && state.entityTypes.filter(type => type.category?.id === EntityTypeCategoryEnum.Module
        || type.category?.id === EntityTypeCategoryEnum.Object
        || type.category?.id === EntityTypeCategoryEnum.FeatureFlag));

export const fieldEntityTypes = createSelector(accessPolicies, (state, props) => state.entityTypes?.filter(type => type.category?.id === EntityTypeCategoryEnum.Field && type.parent?.id === props.parentId));
export const accessPolicy = createSelector(accessPolicies, state => state.item);

export const allPermissions = createSelector(accessPolicies, state => state.allPermissions);
export const selectedPermissions = createSelector(accessPolicies, state => state.selectedPermissions);

export const actionTypes = createSelector(accessPolicies, state => state.actionTypes);
export const orgId = createSelector(accessPolicies, state => state.orgId);

export const actionBar = createSelector(accessPolicies, state => state.actionBar);
