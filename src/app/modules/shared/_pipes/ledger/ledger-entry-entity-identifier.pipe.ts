import { PipeTransform, Pipe } from '@angular/core';
import { LedgerEntry } from '@app/models/closing-statement';

@Pipe({ name: 'ledgerEtryEntityIdentifier' })
export class LedgerEtryEntityIdentifierPipe implements PipeTransform {
  transform(entry: LedgerEntry) {
    return entry.payeeOrgId ?? entry.relatedEntityId ?? entry.externalSourceEntityId;
  }
}
