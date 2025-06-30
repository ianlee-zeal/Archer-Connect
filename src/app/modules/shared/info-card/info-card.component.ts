import { Component, Input, ViewEncapsulation } from '@angular/core';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class InfoCardComponent {
  @Input() state: InfoCardState = InfoCardState.Pending;
  @Input() externalBorder: boolean = true;
  @Input() isSquareCard: boolean = false;
  @Input() showInnerCard: boolean = true;
  public readonly InfoCardState = InfoCardState;
}
