import { createReducer, on, Action } from '@ngrx/store';

import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';
import * as actions from './actions';

export interface DisbursementWorksheetModalCommonState {
  dwDeficienciesSummary: DeficiencySummaryOption[],
}

const initialProjectsCommonState: DisbursementWorksheetModalCommonState = {
  dwDeficienciesSummary: null,
};

const commonReducer = createReducer(
  initialProjectsCommonState,
  // DW generation
  on(
    actions.GetDocumentGenerationDeficienciesSummarySuccess,
    (state: DisbursementWorksheetModalCommonState, { requestDeficiencies }: { requestDeficiencies: DeficiencySummaryOption[] }) => ({ ...state, dwDeficienciesSummary: requestDeficiencies }),
  ),
  on(actions.ResetDwDeficienciesSummary, (state: DisbursementWorksheetModalCommonState) => ({ ...state, dwDeficienciesSummary: null })),
);

export function reducer(state: DisbursementWorksheetModalCommonState | undefined, action: Action): DisbursementWorksheetModalCommonState {
  return commonReducer(state, action);
}
