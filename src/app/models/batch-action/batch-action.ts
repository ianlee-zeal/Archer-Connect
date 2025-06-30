import { Auditable } from '../auditable';
import { SaveDocumentGeneratorRequest } from '../documents';
import { IdValue } from '../idValue';
import { BatchActionFilter, BatchActionFilterDto } from './batch-action-filter';

export class BatchAction extends Auditable {
  id: number;
  entityTypeId: number;
  entityId: number;
  entityType: IdValue;
  config: string;
  countTotal: number;
  countSuccessful: number;
  countErrored: number;
  countWarned: number;
  countLoaded: number;
  documentGeneratorId: number;
  documentGenerator: SaveDocumentGeneratorRequest;
  batchActionFilter: BatchActionFilter;
  channelName: string;

  public static toModel(item: any): BatchAction {
    if (!item) {
      return null;
    }

    return {
      ...Auditable.toModel(item),
      id: item.id,
      entityId: item.entityId,
      entityType: item.entityType,
      entityTypeId: item.entityTypeId,
      config: item.config,
      countTotal: item.countTotal,
      countSuccessful: item.countSuccessful,
      countErrored: item.countErrored,
      countWarned: item.countWarned,
      countLoaded: item.countLoaded,
      documentGeneratorId: item.documentGeneratorId,
      documentGenerator: SaveDocumentGeneratorRequest.toModel(item.documentGenerator),
      batchActionFilter: BatchActionFilter.toModel(item.batchActionFilter),
      channelName: item.pusherChannelName,
    };
  }
}

export interface BatchActionDto {
  entityTypeId: number,
  entityId: number,
  batchActionFilters: BatchActionFilterDto[],
  pusherChannelName: string,
  batchActionTemplateId: number,
  config?: string | null,
}
