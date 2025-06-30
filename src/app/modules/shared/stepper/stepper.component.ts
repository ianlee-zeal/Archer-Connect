/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
import { Component, ContentChildren, Input, OnChanges, QueryList, SimpleChanges } from '@angular/core';
import { CommonHelper } from '@app/helpers/common.helper';
import { StepComponent } from './step/step.component';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent implements OnChanges {
  @ContentChildren(StepComponent) public steps: QueryList<StepComponent>;
  @Input() public stage: number;

  ngOnChanges(changes: SimpleChanges): void {
    const { stage } = this;
    const stageChanges = changes[CommonHelper.nameOf({ stage })];
    if (!stageChanges || !this.steps || isNaN(this.stage)) {
      return;
    }

    this.steps.forEach((step, index) => {
      step.isActive = this.stage === (index + 1);
    });
  }
}
