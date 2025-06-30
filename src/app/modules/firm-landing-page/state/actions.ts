import { createAction, props } from '@ngrx/store';
import { IdValue } from '@app/models';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ProjectDeficiencyCount } from '@app/models/project-deficiency-count';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';

const featureName = '[FirmLandingPage]';

export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());

export const GetProjectsLightList = createAction(`${featureName} Get Projects Light List`, props<{ params: Partial<IServerSideGetRowsRequestExtended> }>());
export const GetProjectsLightListSuccess = createAction(`${featureName} Get Projects Light List Success`, props<{ projectsLight: IdValue[]; totalRecords: number }>());
export const ClearProjectsLightList = createAction(`${featureName} Clear Projects Light List`);

export const getGlobalDeficienciesCount = createAction(`${featureName} Get Global Deficiencies Count`);
export const getGlobalDeficienciesCountSuccess = createAction(`${featureName} Get Global Deficiencies Count Success`, props<{ count: number }>());
export const GetGlobalDeficiencyCountsForProjects = createAction(`${featureName} Get Global Deficiency Counts For Projects`);
export const GetGlobalDeficiencyCountsForProjectsSuccess = createAction(`${featureName} Get Global Deficiency Counts For Projects Success`, props<{ projectDeficiencyCounts: ProjectDeficiencyCount[] }>());

export const GenerateReports = createAction(`${featureName} Generate Reports`, props<{ projectIds: number[], channelName: string }>());
export const GenerateReportsComplete = createAction(`${featureName} Generate Reports Complete`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());
