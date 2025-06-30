import { createAction, props } from '@ngrx/store';

import { SaveDocumentGeneratorRequest } from '@app/models/documents';

import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';

const featureName = '[Project]';
export const FEATURE_NAME = `${featureName} Disbursement WorkSheet Modal`;

export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());
export const ResetError = createAction(`${featureName} Reset Error`);

export const EnqueueDWGeneration = createAction(`${featureName} Enqueue DW Generation`, props<{ generatorId: number, channelName: string }>());
export const EnqueueDWGenerationSuccess = createAction(`${featureName} Enqueue DW Generation Success`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());

export const ValidateDocumentGeneration = createAction(`${featureName} Validate Document Generation`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());
export const ValidateDocumentGenerationSuccess = createAction(`${featureName} Validate Document Generation Success`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());
export const GetDocumentGenerationDeficienciesSummary = createAction(`${featureName} Get Document Generation Deficiencies Summary`, props<{ documentGenerationId: number }>());
export const GetDocumentGenerationDeficienciesSummarySuccess = createAction(`${featureName} Get Document Generation Deficiencies Summary Success`, props<{ requestDeficiencies: DeficiencySummaryOption[] }>());
export const ResetDwDeficienciesSummary = createAction(`${featureName} Reset Dw Deficiencies Summary`);
