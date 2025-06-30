import { DateHelper } from '@app/helpers/date.helper';
import { StringHelper } from '../helpers/string.helper';
import { KeyValue } from '.';

export class ClaimantProductDetails {
  items: KeyValue[];
  lastModifiedDate: Date | null;

  constructor(model?: Partial<ClaimantProductDetails>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClaimantProductDetails | null {
    if (item) {
      const result = !StringHelper.isEmpty(item.jsondoc) ? JSON.parse(item.jsondoc) : null;
      return {
        items: result ? Object.keys(result).map(k => <KeyValue>{ key: k, value: result[k] }) : [],
        lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
      };
    }
    return null;
  }
}
