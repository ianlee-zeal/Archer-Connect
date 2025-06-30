import { Component, Input } from '@angular/core';
import { CommonHelper } from '../../../helpers/common.helper';
import { ActionHandlersMap } from '../action-bar/action-handlers-map';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() public header: string;
  @Input() public headerAdditional: string = null;
  @Input() public headerThird?: string = null;
  @Input() public headerWidth: number;
  @Input() public maxWidth: number;
  @Input()
  public get hideSeparator() {
    return this.isSeparatorHidden;
  }

  public set hideSeparator(value: any) {
    this.isSeparatorHidden = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get collapsable() {
    return this.isCollapsable;
  }

  public set collapsable(value: any) {
    this.isCollapsable = CommonHelper.setShortBooleanProperty(value);
  }

  @Input() actionBar: ActionHandlersMap;
  @Input() isHeaderFlexRow = false;

  public isSeparatorHidden: boolean = false;
  public isCollapsable: boolean = false;
  public isCollapsed: boolean = false;

  public toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
