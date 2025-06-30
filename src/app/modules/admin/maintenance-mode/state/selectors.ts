import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromMaintenance from './reducer';
import { featureName } from './actions';

const maintenance = createFeatureSelector<fromMaintenance.MaintenanceState>(featureName);

export const maintenanceList = createSelector(maintenance, (state:fromMaintenance.MaintenanceState) => state.maintenanceList);
export const maintenanceBannerList = createSelector(maintenance, (state:fromMaintenance.MaintenanceState) => state.maintenanceBannerList);
