import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromDashboard from '../../state';
import { selectors } from '../state';
import { DocumentIntakeListComponent } from '../document-intake-list/document-intake-list.component';

@Component({
  selector: 'app-document-intake',
  templateUrl: './document-intake.component.html',
  styleUrls: ['./document-intake.component.scss'],
})
export class DocumentIntakeComponent {
  @ViewChild('document-intake-list') documents: DocumentIntakeListComponent;
  public readonly actionBar$ = this.store.select(selectors.actionBar);

  public readonly gridId: GridId = GridId.DocumentIntake;

  constructor(
    private store: Store<fromDashboard.AppState>,
  ) { }
}
