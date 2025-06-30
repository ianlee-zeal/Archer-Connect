import { Component } from '@angular/core';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ContextBarElement } from '@app/entities/context-bar-element';

@Component({
  selector: 'app-org-access-index',
  templateUrl: './org-access-index.component.html',
  styleUrls: ['./org-access-index.component.scss'],
})
export class OrgAccessIndexComponent {
  title = 'Example of a list';
  elements: ContextBarElement[] = [
    { column: 'Claimant', valueGetter: () => 'Joe Smith' },
    { column: 'Lien Status', valueGetter: () => 'Pending Finalization' },
    { column: 'Date', valueGetter: () => '03 Nov, 2018' },
    { column: 'Number', valueGetter: () => '264SSRT-95971' },
  ];

  additionalActionBarElements = [
    { icon: 'assets/images/action_ic_new.png', name: 'SecondNew' },
  ];

  // componentHash: { [key: string]: string } = {
  //   generalInfo: 'General Info',
  //   roles: 'Roles',
  // };

  public actionBarActionHandlers: ActionHandlersMap = {};

  currentComponent = 'generalInfo';

  cancel() {
    console.log('cancel');
  }
}
