import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { Component, Input } from '@angular/core';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { NEW_ID } from '@app/helpers/constants';

@Component({
  selector: 'app-probate-notes',
  templateUrl: './probate-notes.component.html',
  styleUrls: ['./probate-notes.component.scss'],
})
export class ProbateNotesComponent {
  readonly entityTypeId = EntityTypeEnum.Probates;
  public notesEditModeChanged: boolean = false;
  public notesExpanded: boolean = false;
  @Input() id: number;
  @Input() isProbateEditMode: boolean;
  @Input() canEdit = true;
  @Input() isEditEnabled = true;

  actionBar: ActionHandlersMap;

  public onActionBarUpdated(actionBar: ActionHandlersMap) {
    if (!actionBar) {
      return;
    }

    this.actionBar = {
      ...actionBar,
      back: null,
      new: {
        ...actionBar.new,
        hidden: () => !this.isEditEnabled || !this.canEdit || this.notesEditModeChanged || (!this.isProbateEditMode && this.isNewProbate),
      },
      save: {
        ...actionBar.save,
        hidden: () => !this.notesEditModeChanged || this.isNewProbate,
      },
      expandNotes: {
        ...actionBar.expandNotes,
        hidden: () => this.notesExpanded || this.isNewProbate,
      },
      collapseNotes: {
        ...actionBar.collapseNotes,
        hidden: () => !this.notesExpanded || this.isNewProbate,
      },
    };
  }

  private get isNewProbate(): boolean {
    return this.id === NEW_ID;
  }

  public onNotesEditModeChanged(isEdit: boolean) {
    this.notesEditModeChanged = isEdit;
  }

  public onNotesExpanded(isExpanded: boolean) {
    this.notesExpanded = isExpanded;
  }
}
