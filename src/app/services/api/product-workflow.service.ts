import { Injectable } from '@angular/core';

import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ProductWorkflowService extends RestService<any> {
  endpoint = '/product-workflows';
}
