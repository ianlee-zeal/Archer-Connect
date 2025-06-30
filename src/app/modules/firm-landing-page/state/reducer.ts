import { Action, createReducer, on } from "@ngrx/store";
import * as FirmLandingPageActions from "./actions";
import { IdValue } from "@app/models";
import { ProjectDeficiencyCount } from '@app/models/project-deficiency-count';

export interface FirmLandingPageState {
    idValueCases?: IdValue[];
    globalDeficienciesCount: number;
    projectDeficiencyCounts?: ProjectDeficiencyCount[];
}

const initialState: FirmLandingPageState = {
    idValueCases: null,
    globalDeficienciesCount: null,
    projectDeficiencyCounts: null,
};

export const firmLandingPageReducer = createReducer(
    initialState,
    on(FirmLandingPageActions.GetProjectsLightListSuccess, (state, { projectsLight }) => ({ ...state, idValueCases: projectsLight })),
    on(FirmLandingPageActions.ClearProjectsLightList, state => ({ ...state, idValueCases: null })),
    on(FirmLandingPageActions.getGlobalDeficienciesCountSuccess, (state, { count }) => ({ ...state, globalDeficienciesCount: count })),
    on(FirmLandingPageActions.GetGlobalDeficiencyCountsForProjectsSuccess, (state, { projectDeficiencyCounts }) => ({ ...state, projectDeficiencyCounts: projectDeficiencyCounts })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function FirmLandingPageReducer(state: FirmLandingPageState | undefined, action: Action) {
    return firmLandingPageReducer(state, action);
}
