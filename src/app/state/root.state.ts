import { AddressState, IdValue, LienPhase, QuickSearchItem } from '@app/models';
import { HashTable } from '@app/models/hash-table';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { Dictionary, IDictionary, KeyValuePair } from '@app/models/utils';
import { EntityTypeEnum } from '@app/models/enums';
import { EntityStatus } from '../models/entity-status';

export interface IGridColumn {
  colId: string;
  pinned: boolean;
}

export interface IGridSettings {
  itemsOnPage: number;
  colsPinned: IGridColumn[];
}

export interface IGridSettingsMap {
  [entity: string]: IGridSettings;
}

export interface IGridLocalDataMap {
  [entity: string]: IGridLocalData;
}

export interface ISortModel {
  colId: string;
  sort: string;
}

export interface IGridLocalData {
  highlightedRowIndex: number;
  filters: HashTable<FilterModel>;
  sort: ISortModel[];
  isAllRowSelected: boolean,
  selectedRecordsIds: Map<string, boolean>,
}

export interface IGridStorageData {
  columnOrder?: KeyValuePair<string, number>[];
  columnVisibility?: KeyValuePair<string, boolean>[];
}

export interface RootState {
  dropdown_values: {
    accessPolicies: IdValue[],
    role_types: IdValue[],
    entities: IdValue[],
    permissionTypes: IdValue[],
    documentTypes: IdValue[],
    documentStatuses: IdValue[],
    documentChannels: IdValue[],
    addressTypes: IdValue[],
    states: AddressState[],
    countries: IdValue[],
    maritalStatuses: IdValue[],
    genders: IdValue[],
    phoneTypes: IdValue[],
    personRelationshipTypes: IdValue[],
    personRepresentativeTypes: IdValue[],
    organizationTypes: IdValue[],
    bankAccountTypes: IdValue[],
    mailTrackingNumberType: IdValue[],
    injuryEventTypes: IdValue[],
    clientFinalizedStatuses: IdValue[],
    lienPhases: LienPhase[],
    lienTypeGroups: IdValue[],
    projectTypesOptions: IdValue[],
    projectStatusesOptions: IdValue[],
    electionFormStatusOptions: IdValue[],
    batchPaymentsOptions: IdValue[],
    frequencyOptions: IdValue[],
    billToOptions: IdValue[],
  };
  menu: any;
  gridSettings: IGridSettingsMap;
  gridLocalData: IGridLocalDataMap;
  gridStorageData: IGridStorageData,
  entityStatuses: EntityStatus[];
  error: any;
  loadingInProgress: IDictionary<string, boolean>,
  statusesByEntityType: IDictionary<EntityTypeEnum, IdValue[]>,
  quickSearchResults?: QuickSearchItem[];
  banner: string | null;
  isBannerClosed: boolean;
}

export const initialState: RootState = {
  dropdown_values: <any>{},
  gridSettings: {},
  gridLocalData: {},
  gridStorageData: {},
  entityStatuses: null,
  menu: null,
  error: null,
  loadingInProgress: new Dictionary<string, boolean>(),
  statusesByEntityType: new Dictionary<EntityTypeEnum, IdValue[]>(),
  quickSearchResults: null,
  banner: null,
  isBannerClosed: true,
};
