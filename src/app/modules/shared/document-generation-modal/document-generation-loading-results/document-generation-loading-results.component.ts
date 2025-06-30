import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { sharedSelectors, AppState } from '../../state';

@Component({
  selector: 'app-document-generation-loading-results',
  templateUrl: './document-generation-loading-results.component.html',
  styleUrls: ['./document-generation-loading-results.component.scss']
})
export class DocumentGenerationLoadingResultsComponent {
  public state$ = this.store.select(sharedSelectors.documentGenerationSelectors.root);
  constructor(private store: Store<AppState>) { }
}
