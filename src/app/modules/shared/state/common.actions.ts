import { createAction, props } from '@ngrx/store';

import { RelatedPage } from '@app/modules/shared/grid-pager';
import { MimeType } from '../../../models/mime-type';
import { NavigationSettings } from '../action-bar/navigation-settings';
import { Pager } from '../grid-pager/pager';

export interface IPagerPayload {
  /**
   * Parent page to which current page belongs.
   *
   * @type {RelatedPage}
   * @memberof IEntityPaymentsPayload
   */
  parentPage?: RelatedPage;
}

const featureName = '[Shared]';

// TODO Unused Code. Clean up
export const GetForms = createAction(`${featureName} Get Forms`, props<{ search: any }>());
export const GetFormsComplete = createAction(`${featureName} Get Forms Complete`, props<{ formsIndex: any }>());

export const NewTask = createAction(`${featureName} New Task`);
export const OpenTask = createAction(`${featureName} Open Task`);
export const UpsertTask = createAction(`${featureName} Upsert Task`, props<{ task: any }>());
export const DeleteTask = createAction(`${featureName} Delete Task`, props<{ id: number }>());

export const GetNote = createAction(`${featureName} Get Note`, props<{ id: number }>());
export const GetNoteComplete = createAction(`${featureName} Get Note Complete`, props<{ Note: any }>());
export const UpsertNote = createAction(`${featureName} Upsert Note`, props<{ Note: any }>());
export const DeleteNote = createAction(`${featureName} Delete Note`, props<{ id: number }>());

export const Error = createAction(`${featureName} Error`, props<{ error: any }>());

export const GetMimeTypes = createAction(`${featureName} Get Mime Types`);
export const GetMimeTypesComplete = createAction(`${featureName} Get Mime Types Complete`, props<{ mimeTypes: MimeType[], allowedFileExtensions: string[] }>());
export const GotoParentView = createAction(`${featureName} Goto Parent View`, (alterRoute: string = '.') => ({ alterRoute }));
export const GotoDefaultView = createAction(`${featureName} Goto Default View`, props<{ userId: number }>());

export const CreatePager = createAction(`${featureName} Create Pager`, props<{ relatedPage: RelatedPage, settings: NavigationSettings, pager?: Partial<Pager> }>());
export const UpdatePager = createAction(`${featureName} Update Pager`, props<{ relatedPage?: RelatedPage, pager: Partial<Pager> }>());
export const ActivatePager = createAction(`${featureName} Activate Pager`, props<{ relatedPage: RelatedPage }>());
export const ResetActivePager = createAction(`${featureName} Reset Active Pager`);

export const FormInvalid = createAction(`${featureName} Form Is Invalid`);

export const Cancel = createAction(`${featureName} Cancel`);

export const SetAllowedFileExtensions = createAction('Set Allowed File Extensions', props<{ allowedFileExtensions: string[] }>());