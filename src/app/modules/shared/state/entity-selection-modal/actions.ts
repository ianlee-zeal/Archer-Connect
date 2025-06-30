import { Org, Settlement, Matter, Project, PersonContact } from '@app/models';
import { Attorney } from '@app/models/attorney';
import { ProjectContact } from '@app/models/project-contact';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const featureName: string = '[Entity Selection Modal]';

export const Error = createAction(`${featureName} API Error`, props<{ error: string }>());

export const SearchCustomers = createAction(`${featureName} Search Customers`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchCustomersSuccess = createAction(`${featureName} Search Customers Success`, props<{ items: Org[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchFirms = createAction(`${featureName} Search Firms`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchFirmsSuccess = createAction(`${featureName} Search Firms Success`, props<{ items: Org[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchSettlements = createAction(`${featureName} Search Settlements`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchSettlementsSuccess = createAction(`${featureName} Search Settlements Success`, props<{ items: Settlement[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchAttorneys = createAction(`${featureName} Search Attorneys`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchAttorneysSuccess = createAction(`${featureName} Search Attorneys Success`, props<{ items: Attorney[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchMatters = createAction(`${featureName} Search Matters`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchMattersSuccess = createAction(`${featureName} Search Matters Success`, props<{ items: Matter[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchProjects = createAction(`${featureName} Search Projects`, props<{ params: IServerSideGetRowsParamsExtended, orgId: number, key?: string }>());
export const SearchProjectsSuccess = createAction(`${featureName} Search Projects Success`, props<{ items: Project[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchProjectContacts = createAction(`${featureName} Search Project Contacts`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchProjectContactsSuccess = createAction(`${featureName} Search Project Contacts Success`, props<{ items: ProjectContact[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchClientContacts = createAction(`${featureName} Search Client Contacts`, props<{ params: IServerSideGetRowsParamsExtended, clientId: number }>());
export const SearchClientContactsSuccess = createAction(`${featureName} Search Client Contacts Success`, props<{ items: PersonContact[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchQSFAdministrationOrg = createAction(`${featureName} Search QSF Administration Org`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchQSFAdministrationOrgSuccess = createAction(`${featureName} Search QSF Administration Org Success`, props<{ items: Org[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchRelatedServices = createAction(`${featureName} Search Related Services`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchRelatedServicesSuccess = createAction(`${featureName} Search Related Services Success`, props<{ items: any[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchOrganizations = createAction(`${featureName} Search Organizations`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchOrganizationsSuccess = createAction(`${featureName} Search Organizations Success`, props<{ items: Org[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());

export const SearchRevRecItems = createAction(`${featureName} Search Rev Rec Items`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchInvoicingItems = createAction(`${featureName} Search Invoicing Items`, props<{ params: IServerSideGetRowsParamsExtended }>());

export const SearchArcherUsers = createAction(`${featureName} Search Archer Users`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const SearchArcherUsersSuccess = createAction(`${featureName} Search ArcherUsers Success`, props<{ items: any[], totalRecords: number, params: IServerSideGetRowsParamsExtended }>());
