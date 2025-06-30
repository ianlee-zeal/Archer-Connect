import { PipeTransform, Pipe } from '@angular/core';
import { DocumentLink } from '@app/models/documents';
import { EntityTypeEnum } from '@app/models/enums';

@Pipe({ name: 'entityTypeCleanedPipe' })
export class EntityTypeCleanedPipe implements PipeTransform {
  transform(documentLinks: DocumentLink[]): DocumentLink[] {
    const clientLink = documentLinks.find((o:DocumentLink) => o.entityType.id == EntityTypeEnum.Clients);
    if (clientLink && documentLinks.length > 1) {
      const link = documentLinks.find((o:DocumentLink) => o.entityType.id == EntityTypeEnum.Organizations || o.entityType.id == EntityTypeEnum.ClientContacts);
      if (link) return [link];
    }
    return documentLinks;
  }
}
