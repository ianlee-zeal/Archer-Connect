import { Component } from '@angular/core';

import { BasePagination } from '../_abstractions/base-pagination';

@Component({
  selector: 'app-simple-pager',
  templateUrl: './simple-pager.component.html',
  styleUrls: ['./simple-pager.component.scss']
})
export class SimplePagerComponent extends BasePagination {
}
