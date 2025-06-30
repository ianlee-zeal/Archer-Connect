import { Component, Input } from '@angular/core';
import { Auditable } from '@app/models/auditable';

import { CommonHelper } from '@app/helpers/common.helper';

@Component({
  selector: 'app-system-fields-section',
  templateUrl: './system-fields-section.component.html',
  styleUrls: ['./system-fields-section.component.scss'],
})
export class SystemFieldsSectionComponent {
  @Input() public item: Auditable;

  @Input()
  public get modalMode() {
    return this.isModalMode;
  }

  public set modalMode(value: any) {
    this.isModalMode = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get onlyModified() {
    return this.showOnlyModified;
  }

  public set onlyModified(value: any) {
    this.showOnlyModified = CommonHelper.setShortBooleanProperty(value);
  }

  public isModalMode: boolean = false;
  public showOnlyModified: boolean = false;
}
