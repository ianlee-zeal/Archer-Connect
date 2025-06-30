import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewEncapsulation } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { CommonHelper } from '@app/helpers/common.helper';
import { TooltipPositionEnum } from '@app/models/enums/tooltip-position.enum';
import { ArrayHelper } from '@app/helpers';

@Component({
  selector: 'card-row',
  templateUrl: './card-row.component.html',
  styleUrls: ['./card-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CardRowComponent implements OnInit, OnChanges {
  @Input() public label: string;
  @Input() public value: string | boolean;
  @Input() public labelWidth: number;
  @Input() public labelWeight: string;
  @Input() public labelColor: string;
  @Input() public marginTop: number;
  @Input() public marginLeft: number;
  @Input() public valueClass: string;
  @Input() public inputId: string;
  @Input() public control: AbstractControl;
  @Input() public containerWidth: number;
  @Input() public maxContentWidth: number = 300;
  @Input() public valuePaddingTop: number;
  @Input() public tooltip: string = '';
  @Input() public tooltipPosition: TooltipPositionEnum;
  @Input() public labelTooltip: string = '';
  @Input() tooltipTemplateRef: TemplateRef<any>;
  @Input() keepLineBreaks = false;
  @Input() reversedOrder = false;
  @Input() hideText = false;
  @Input() iconTooltipClass = 'fa fa-info-circle';
  @Input() public bulletList = false;
  @Input() public hyperlink = undefined;

  @Input()
  public get required(): boolean {
    return this.isRequired;
  }

  public set required(value: any) {
    this.isRequired = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get errorOnTheRight(): boolean {
    return this.isErrorOnTheRight;
  }

  public set errorOnTheRight(value: any) {
    this.isErrorOnTheRight = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get hideColon(): boolean {
    return this.isColonHidden;
  }

  public set hideColon(value: any) {
    this.isColonHidden = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get noWrap(): boolean {
    return this.denyWrapValue;
  }

  public set noWrap(value: any) {
    this.denyWrapValue = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get wordWrap(): boolean {
    return this.isBreakWordWrap;
  }

  public set wordWrap(value: any) {
    this.isBreakWordWrap = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get hideLabel(): boolean {
    return this.isHideLabel;
  }

  public set hideLabel(value: any) {
    this.isHideLabel = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get noLabelPadding(): boolean {
    return this.denyLabelPadding;
  }

  public set noLabelPadding(value: any) {
    this.denyLabelPadding = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get labelShrink(): string {
    return this.labelShrinkCss;
  }

  public set labelShrink(value: any) {
    this.labelShrinkCss = value;
  }

  @Input()
  public get containValue(): boolean {
    return this.shouldContainValue;
  }

  public set containValue(value: any) {
    this.shouldContainValue = CommonHelper.setShortBooleanProperty(value);
  }

  @Input()
  public get alignContentVertically(): boolean {
    return this.isAlignContentVertically;
  }

  public set alignContentVertically(value: any) {
    this.isAlignContentVertically = CommonHelper.setShortBooleanProperty(value);
  }


  public labelText: string;
  public isColonHidden: boolean;
  public denyWrapValue: boolean;
  public isHideLabel: boolean;
  public shouldContainValue: boolean;
  public denyLabelPadding: boolean;
  public labelShrinkCss: string;
  public isBreakWordWrap: boolean;
  public ArrayHelper = ArrayHelper;


  private isRequired: boolean;
  private isErrorOnTheRight: boolean;
  private isAlignContentVertically: boolean;
  public readonly tooltipPositionEnum = TooltipPositionEnum;

  public ngOnInit(): void {
    this.setLabelText(this.label);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { label } = this;
    const labelChanges = changes[CommonHelper.nameOf({ label })];
    if (labelChanges) {
      this.setLabelText(this.label);
    }
  }

  private setLabelText(label: string): void {
    this.labelText = label?.trim().replace(/:$/, '');
  }

  public calcContentWidth(): number {
    const contentWidth = this.containerWidth - this.labelWidth;
    return contentWidth > this.maxContentWidth
      ? this.maxContentWidth
      : contentWidth;
  }
}
