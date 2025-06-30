import { Maintenance } from '@app/models/admin/maintenance';
import { Action, createReducer, on } from '@ngrx/store';
import * as actions from './actions';
import { MaintenanceBanner } from '@app/models/admin/maintenance-banner';

export interface MaintenanceState {
  maintenanceList: Maintenance[];
  maintenanceBannerList: MaintenanceBanner[];
}

export const initialState: MaintenanceState = {
  maintenanceList: null,
  maintenanceBannerList: null,
};

export const Reducer = createReducer(
  initialState,
  on(actions.Error, (state: MaintenanceState, { error }: { error: string }) => (
    { ...state, error })),
  on(actions.GetMaintenanceListSuccess, (state: MaintenanceState, { maintenanceList }: { maintenanceList: Maintenance[] }) => (
    { ...state, maintenanceList })),
  on(actions.UpdateMaintenanceListSuccess, (state: MaintenanceState, { maintenanceList }: { maintenanceList: Maintenance[] }) => (
    { ...state, maintenanceList })),
  on(actions.UpdateMaintenanceOperationSuccess, (state: MaintenanceState, { maintenanceList, maintenanceBannerList }: { maintenanceList: Maintenance[], maintenanceBannerList: MaintenanceBanner[] }) => (
      { ...state, maintenanceList, maintenanceBannerList })),
  on(actions.GetMaintenanceBannerListSuccess, (state: MaintenanceState, { maintenanceBannerList }: { maintenanceBannerList: MaintenanceBanner[] }) => (
    { ...state, maintenanceBannerList })),
);

export function reducer(state: MaintenanceState | undefined, action: Action): MaintenanceState {
  return Reducer(state, action);
}
