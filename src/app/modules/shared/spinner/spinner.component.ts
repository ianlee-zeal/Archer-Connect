import { Component, Input } from '@angular/core';

import { CommonHelper } from '@app/helpers/common.helper';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
  @Input()
  public get small() {
    return this.isSmall;
  }

  public set small(value: any) {
    this.isSmall = CommonHelper.setShortBooleanProperty(value);
  }

  private isSmall: boolean;
}
