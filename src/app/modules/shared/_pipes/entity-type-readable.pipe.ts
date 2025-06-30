import { PipeTransform, Pipe } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';

@Pipe({ name: 'entityTypeReadable' })
export class EntityTypeReadablePipe implements PipeTransform {
  transform(entityType: EntityTypeEnum) {
    switch (entityType) {
      case EntityTypeEnum.Clients: return "Claimants";
      case EntityTypeEnum.LienProducts: return "Liens";

      default: return EntityTypeEnum[entityType];
    }
  }
}
