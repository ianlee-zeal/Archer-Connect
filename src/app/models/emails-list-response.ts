import { EntityPair } from '@app/modules/shared/_interfaces';
import { Email } from '.';

export interface EmailsListResponse {
  emails: Email[],
  entityPair: EntityPair,
}
