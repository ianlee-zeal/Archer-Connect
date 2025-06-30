import moment from 'moment-timezone';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { SearchState } from './advanced-search/search-state';
import { EntityTypeEnum } from './enums/entity-type.enum';
import { SearchTypes } from './advanced-search/search-types.hash';
import { GridId } from './enums/grid-id.enum';
import { AdvancedSearchTypeEnum } from './advanced-search/advanced-search-types.enum';
import { Auditable } from './auditable';

export class SavedSearch extends Auditable {
  public id?: number;
  public name: string;
  public searchModel: SearchState[];
  public entityType: EntityTypeEnum;
  public lastRunDate?: Date;
  public advancedSearchType: AdvancedSearchTypeEnum;
  public orgId: number;
  public users: SelectOption[];
  public runCount?: number;
  public gridId?: GridId;
  public currentUserId: number;
  public skipRestoring?: boolean;
  public projectId?: number;

  public static toDto(item: SavedSearch): any {
    return {
      id: item.id,
      name: item.name,
      searchModel: JSON.stringify(item.searchModel),
      entityType: item.entityType,
      advancedSearchType: item.advancedSearchType,
      orgId: item.orgId,
      userIds: item.users?.map(user => user.id),
      projectId: item.projectId,
    };
  }

  public static toModel(item: any): SavedSearch {
    return {
      ...super.toModel(item),
      currentUserId: item.currentUserId,
      id: item.id,
      runCount: item.runCount,
      name: item.name,
      advancedSearchType: item.type,
      orgId: item.orgId,
      lastRunDate: item.lastRunDate,
      gridId: SavedSearch.setGridId(item.entityTypeId, item.projectId),
      users: item.userIdNamePairs,
      searchModel: JSON.parse(item.searchModel).filter(search => search.field.type).map(search => {
        if (search.field.type.filterType === SearchTypes.date.filterType) {
          search.term = search.term ? moment(search.term).toDate() : null;
          search.termTo = search.termTo ? moment(search.termTo).toDate() : null;
        }
        return search;
      }),
      entityType: item.entityTypeId,
      projectId: item.projectId,
    };
  }

  private static setGridId(entityTypeId: EntityTypeEnum, projectId?: number): GridId {
    switch (entityTypeId) {
      case EntityTypeEnum.Clients:
        if (!projectId) {
          return GridId.Claimants;
        }
        return GridId.ProjectClaimantsOverview;
      case EntityTypeEnum.Probates:
        return GridId.Probates;
      case EntityTypeEnum.ProjectClaimantSummary:
        return GridId.ClaimantSummaryList;
      case EntityTypeEnum.ProjectClaimantSummaryRollup:
        return GridId.ClaimantSummaryRollupList;
      case EntityTypeEnum.PaymentQueues:
        return GridId.PaymentQueue;
      default:
        return null;
    }
  }
}
