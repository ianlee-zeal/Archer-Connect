import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { dateRangeValidator } from '../../../validators/date-range.validator';

const DEFAULT_FROM_FIELD_NAME = 'from';
const DEFAULT_TO_FIELD_NAME = 'to';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
})
export class DateRangeComponent implements OnInit {
  @Input() public range: UntypedFormGroup;
  @Input() public labelWidth: number;

  @Input() public toFieldName: string;
  @Input() public fromFieldName: string;

  public ngOnInit(): void {

    if (!this.range) {
      throw new Error('You should pass range input param');
    }

    const controls = this.range.controls;

    const fromFieldName = this.fromFieldName || DEFAULT_FROM_FIELD_NAME;
    const toFieldName = this.toFieldName || DEFAULT_TO_FIELD_NAME;

    this.fromFieldName = fromFieldName;
    this.toFieldName = toFieldName;

    if (!controls[fromFieldName] || !controls[toFieldName]) {
      throw new Error(`Not all necessary fields are in the "range" form group. Fields "${fromFieldName}" & "${toFieldName}" are expected.`);
    }

    this.range.setValidators(dateRangeValidator(fromFieldName, toFieldName));
  }
}
