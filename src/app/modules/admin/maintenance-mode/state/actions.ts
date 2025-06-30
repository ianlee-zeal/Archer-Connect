import { Maintenance } from '@app/models/admin/maintenance';
import { MaintenanceBanner } from '@app/models/admin/maintenance-banner';
import { createAction, props } from '@ngrx/store';

export const featureName = '[Maintenance]';

export const Error = createAction(`${featureName} Error`, props<{ error: any }>());

export const GetMaintenanceList = createAction(`${featureName} Get Maintenance List`);
export const GetMaintenanceListSuccess = createAction(`${featureName} Get Maintenance List Success`, props<{ maintenanceList: Maintenance[] }>());

export const UpdateMaintenanceList = createAction(`${featureName} Update Maintenance List`, props<{ maintenanceList: Maintenance[] }>());
export const UpdateMaintenanceListSuccess = createAction(`${featureName} Update Maintenance List Success`, props<{ maintenanceList: Maintenance[] }>());

export const UpdateMaintenanceBanner = createAction(`${featureName} Update Banner Text`, props<{ maintenanceBanner: MaintenanceBanner }>());

export const UpdateMaintenanceOperation = createAction(`${featureName} Update Maintenance Operation`, props<{ maintenanceList: Maintenance[], maintenanceBannerList: MaintenanceBanner[] }>());
export const UpdateMaintenanceOperationSuccess = createAction(`${featureName} Update Maintenance Operation Success`, props<{ maintenanceList: Maintenance[], maintenanceBannerList: MaintenanceBanner[] }>());

export const SaveBannerText = createAction(`${featureName} Save Banner Text`, props<{ bannerText: string }>());
export const SaveBannerTextSuccess = createAction(`${featureName} Save Banner Text Success`, props<{ bannerText: string }>());

export const GetMaintenanceBannerList = createAction(`${featureName} Get Banner Notification List`);
export const GetMaintenanceBannerListSuccess = createAction(`${featureName} Get Banner Notification List Success`, props<{ maintenanceBannerList: MaintenanceBanner[] }>());