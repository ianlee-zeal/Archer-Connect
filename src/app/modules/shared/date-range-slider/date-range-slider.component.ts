import { Component, OnInit, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import moment from 'moment-timezone';

@Component({
  selector: 'app-date-range-slider',
  templateUrl: './date-range-slider.component.html',
  styleUrls: ['./date-range-slider.component.scss'],
})
export class DoubleRangeSliderComponent implements OnInit {
  @Input() public start: Date;
  @Input() public end: Date;
  @Output() public onRangeChanged = new EventEmitter();

  public range: UntypedFormGroup;

  constructor(
    private element: ElementRef,
  ) {}

  sliderWidth: number = 1;
  offsetSliderWidht: number = 0;
  min: Date = null;
  max: Date = null;
  minValueBetween: number = 0;
  valueBetween: moment.unitOfTime.Diff = 'days';
  currentMin: Date = null;
  currentMax: Date = null;
  minValueWidth: string = '0';
  maxValueWidth: string = '0';
  oldMin: Date = null;
  oldMax: Date = null;

  minInputVisible = false;
  maxInputVisible = false;

  private sliderElem: HTMLElement;

  public ngOnInit(): void {
    if (!this.start || !this.end) {
      throw new Error('You should pass range input param');
    }

    this.min = this.start;
    this.max = this.end;
    this.min.setHours(12);
    this.max.setHours(12);

    this.currentMin = new Date(this.min);
    this.currentMax = new Date(this.max);
    this.oldMin = new Date(this.min);
    this.oldMax = new Date(this.max);

    this.range = new UntypedFormGroup({
      from: new UntypedFormControl(this.currentMin),
      to: new UntypedFormControl(this.currentMax),
    });

    this.minValueWidth = '0%'; // `${(this.currentMin * 100) / this.max}%`;
    this.maxValueWidth = '100%'; // `${(this.currentMax * 100) / this.max}%`;
    setTimeout(() => {
      this.sliderElem = this.element.nativeElement.getElementsByClassName('slider')[0];
      this.sliderWidth = (this.sliderElem as HTMLElement).offsetWidth;
      this.offsetSliderWidht = (this.sliderElem as HTMLElement).offsetLeft;
    }, 300);
  }

  changeMinValue = e => {
    e.preventDefault();
    document.addEventListener('mousemove', this.onMouseMoveMin);
    document.addEventListener('mouseup', this.onMouseUpMin);
    this.minInputVisible = false;
  };

  onMouseMoveMin = e => {
    const offsetSliderWidht = (this.sliderElem as HTMLElement).offsetLeft;
    const dragedWidht = e.clientX - offsetSliderWidht;
    const dragedWidhtInPercent = (dragedWidht * 100) / this.sliderWidth;

    const maxDuration = moment(this.max).diff(moment(this.min), this.valueBetween);
    const addDuration = (maxDuration * dragedWidhtInPercent) / 100;
    const currentMin = moment(this.min).add(addDuration, this.valueBetween);
    if ((currentMin >= moment(this.min))
      && (currentMin <= (moment(this.currentMax).add(-this.minValueBetween, this.valueBetween)))) {
      this.minValueWidth = `${dragedWidhtInPercent}%`;
      this.currentMin = currentMin.toDate();
      this.range.patchValue({ from: this.currentMin });
    }
  };

  onMouseUpMin = () => {
    document.removeEventListener('mouseup', this.onMouseUpMin);
    document.removeEventListener('mousemove', this.onMouseMoveMin);
    this.emitRange();
  };

  changeMaxValue = e => {
    e.preventDefault();
    document.addEventListener('mousemove', this.onMouseMoveMax);
    document.addEventListener('mouseup', this.onMouseUpMax);
    this.maxInputVisible = false;
  };

  onMouseMoveMax = e => {
    const offsetSliderWidht = (this.sliderElem as HTMLElement).offsetLeft;
    const dragedWidht = e.clientX - offsetSliderWidht;
    const dragedWidhtInPercent = (dragedWidht * 100) / this.sliderWidth;
    const maxDuration = moment(this.max).diff(moment(this.min), this.valueBetween);
    const addDuration = (maxDuration * dragedWidhtInPercent) / 100;
    const currentMax = moment(this.min).add(addDuration, this.valueBetween);

    if ((currentMax >= (moment(this.currentMin).add(this.minValueBetween, this.valueBetween)))
      && (currentMax <= moment(this.max))) {
      this.maxValueWidth = `${dragedWidhtInPercent}%`;
      this.currentMax = currentMax.toDate();
      this.range.patchValue({ to: this.currentMax });
    }
  };

  onMouseUpMax = () => {
    document.removeEventListener('mouseup', this.onMouseUpMax);
    document.removeEventListener('mousemove', this.onMouseMoveMax);
    this.emitRange();
  };

  public startDateChanged() {
    const date = this.range.value.from as Date;
    if (!date || date.toDateString() === this.currentMin.toDateString()) {
      return;
    }
    const currentDate = moment(date);

    if ((currentDate >= moment(this.min))
    && (currentDate <= (moment(this.currentMax).add(-this.minValueBetween, this.valueBetween)))) {
      const maxDuration = moment(this.max).diff(moment(this.min), this.valueBetween);
      const currentDuration = currentDate.diff(moment(this.min), this.valueBetween);
      const widhtInPercent = (currentDuration * 100) / maxDuration;

      this.minValueWidth = `${widhtInPercent}%`;
      this.currentMin = currentDate.toDate();
      this.range.patchValue({ from: this.currentMin });
      this.emitRange();
    }
  }

  public endDateChanged() {
    const date = this.range.value.to as Date;
    if (!date || date.toDateString() === this.currentMax.toDateString()) {
      return;
    }
    const currentDate = moment(date);

    if ((currentDate >= (moment(this.currentMin).add(this.minValueBetween, this.valueBetween)))
      && (currentDate <= moment(this.max))) {
      const maxDuration = moment(this.max).diff(moment(this.min), this.valueBetween);
      const currentDuration = currentDate.diff(moment(this.min), this.valueBetween);
      const widhtInPercent = (currentDuration * 100) / maxDuration;

      this.maxValueWidth = `${widhtInPercent}%`;
      this.currentMax = currentDate.toDate();
      this.range.patchValue({ to: this.currentMax });
      this.emitRange();
    }
  }

  private emitRange() {
    if (this.changed()) {
      this.onRangeChanged.emit({ from: this.currentMin, to: this.currentMax });
      this.syncOldMinMax();
    }
  }

  private changed() {
    return this.oldMin.getTime() !== this.currentMin.getTime()
      || this.oldMax.getTime() !== this.currentMax.getTime();
  }

  private syncOldMinMax() {
    this.oldMin = new Date(this.currentMin);
    this.oldMax = new Date(this.currentMax);
  }
}
