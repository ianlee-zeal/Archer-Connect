import { Injectable } from '@angular/core';
import { NotesListSearchParams } from '@app/modules/shared/state/notes-list/state';
import { Observable } from 'rxjs';

import { StringHelper } from '@app/helpers';
import { NoteDto } from '@app/models';
import { RestService } from './_rest.service';
import { EntityTypeEnum } from '../../models/enums/entity-type.enum';

@Injectable({ providedIn: 'root' })
export class NotesService extends RestService<any> {
  endpoint = '/notes';

  public getList(searchParams: NotesListSearchParams): Observable<any> {
    let mainEntityType = searchParams.entityTypeIds[0];
    switch (mainEntityType) {
      case EntityTypeEnum.Clients:
        return this.api.get<any>(`/clients/notes/${searchParams.entityId}${StringHelper.queryString(searchParams)}`);
      case EntityTypeEnum.Probates:
        return this.api.get<any>(`/probates/notes/${searchParams.entityId}${StringHelper.queryString(searchParams)}`);
    }
    return this.index(searchParams);
  }

  public create(note: NoteDto): Observable<any> {
    return this.api.post(this.getEndpoint(note.entityTypeId), note);
  }

  public update(note: NoteDto): Observable<any> {
    return this.api.put(this.getEndpoint(note.entityTypeId), note);
  }

  public deleteNote(id: number, entityTypeId: number) {
    return this.api.delete(`${this.getEndpoint(entityTypeId)}/${id}`);
  }

  private getEndpoint(entityTypeId: number): string {
    switch (entityTypeId) {
      case EntityTypeEnum.Probates:
        return '/probates/notes';
    }
    return this.endpoint;
  }
}
