import { Component, Input } from '@angular/core';


@Component({
  selector: 'step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent {
  @Input() public isActive: boolean = false;
  @Input() public label: string;

}
