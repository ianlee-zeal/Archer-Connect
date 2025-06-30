import { createAction, props } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PaginatorParams } from '@app/models';
import { IServerSideGetRowsRequestExtended } from '../../_interfaces/ag-grid/ss-get-rows-request';

export type PaginatorApiCall = (gridParams: IServerSideGetRowsRequestExtended, otherParams?: any) => Observable<any>;
export type PaginatorCallback = (id: number) => void;
export type PaginatorToObjectCallback = (obj: any) => void;

export const Paginator = createAction('Paginator', props<{
  pageNumber: number,
  prevId: number,
  params: PaginatorParams,
  apiCall: PaginatorApiCall,
  callback: PaginatorCallback,
}>());

export const PaginatorToObject = createAction('PaginatorToObject', props<{
  pageNumber: number,
  params: PaginatorParams,
  apiCall: PaginatorApiCall,
  callback: PaginatorToObjectCallback,
}>());
