import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromProjects from '../../state/reducer';

const projectsFeature =
  createFeatureSelector<fromProjects.ProjectsState>('projects_feature');
const scopeOfFeature = createSelector(
  projectsFeature,
  state => state.scopeOfWork
);

export const scopeOfWorkSelectors = {
  allProducts: createSelector(scopeOfFeature, state => state.allProducts),
  allProductConditions: createSelector(
    scopeOfFeature,
    state => state.allProductConditions
  ),
  productCategories: createSelector(
    scopeOfFeature,
    state => state.productCategories
  ),
  projectsLight: createSelector(scopeOfFeature, state => state.projectsLight),
  loading: createSelector(scopeOfFeature, state => state.loading),
};
