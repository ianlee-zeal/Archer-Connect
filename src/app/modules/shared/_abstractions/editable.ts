import { ActionObject } from '@app/modules/shared/action-bar/action-handlers-map';
import { Input, Directive } from '@angular/core';
import { ValidationForm } from './validation-form';
import { CanLeave } from '../_interfaces/can-leave';

@Directive()
export abstract class Editable extends ValidationForm implements CanLeave {
  // If true leave page with no save confirmation
  protected isSavePerformed: boolean;

  /**
   * Gets or sets the flag indicating whether edit template is shown or now
   *
   * @memberof Editable
   */
  @Input() canEdit = false;

  protected abstract readonly hasChanges: boolean;

  protected edit(): void {
    this.canEdit = true;
  }

  protected save(): void {
    this.isSavePerformed = true;
  }

  public get canLeave(): boolean {
    return this.isSavePerformed || !this.hasChanges;
  }

  protected editAction(): ActionObject {
    return {
      callback: () => this.edit(),
      hidden: () => this.canEdit,
    };
  }
}
