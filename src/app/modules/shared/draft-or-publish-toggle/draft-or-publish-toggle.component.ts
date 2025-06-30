import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonHelper } from '@app/helpers';
import { IdValue } from '@app/models';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { ToggleState } from '@app/models/enums/toggle-state.enum';
import { BaseControlValueAccessor } from '@app/modules/shared/_abstractions/base-control-value-accessor';

@Component({
  selector: 'app-draft-or-publish-toggle',
  templateUrl: './draft-or-publish-toggle.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: DraftOrPublishToggleComponent,
    },
  ],
})
export class DraftOrPublishToggleComponent extends BaseControlValueAccessor implements OnChanges {
  @Input() canPublish: boolean;

  public selectedOption: IdValue = null;

  private readonly Publish = { id: OutputType.Publish, name: 'Publish' };

  public options: IdValue[] = [
    { id: OutputType.Draft, name: 'Draft' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    const { canPublish } = this;
    const entryChange = changes[CommonHelper.nameOf({ canPublish })];
    if (entryChange && entryChange.currentValue) {
      if (this.options.findIndex(o => o.id === OutputType.Publish) === -1) {
        this.options.push(this.Publish);
        this.selectedOption = this.Publish;
      }
      this.options.sort(o => o.id);
    }
  }

  public onToggleChange(opt: IdValue): void {
    this.markAsTouched();
    this.selectedOption = opt;

    this.onChangeCallback(opt ? opt.id : null);
  }

  public writeValue(val: ToggleState): void {
    this.selectedOption = this.options.find(o => o.id === val) ?? null;
  }
}
