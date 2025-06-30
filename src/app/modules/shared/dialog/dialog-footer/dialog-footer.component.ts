import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'dialog-footer',
  templateUrl: './dialog-footer.component.html',
  styleUrls: ['./dialog-footer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogFooterComponent {
  @Input() public contentRight: boolean = false;

}
