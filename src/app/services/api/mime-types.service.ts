import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { MimeType } from '@app/models/mime-type';

@Injectable({
  providedIn: 'root',
})
export class MimeTypesService extends RestService<MimeType> {
  endpoint = '/documentMimeTypes';

  public getMimeTypesList(): Observable<MimeType[]> {
    return this.api.get<Observable<MimeType[]>>(this.endpoint);
  }
}
