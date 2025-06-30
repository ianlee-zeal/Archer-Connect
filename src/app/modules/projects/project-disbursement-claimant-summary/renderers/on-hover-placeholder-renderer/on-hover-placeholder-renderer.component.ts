import { Component } from '@angular/core';
import { BKScrubMatchCodeEnum } from '@app/models/enums/bk-scrub-match-code.enum';
import { BKScrubProductCodeEnumText } from '@app/models/enums/bk-scrub-product-code.enum';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';

/**
 * Component for rendering of on hover placeholder information
 *
 * @export
 * @class OnHoverPlaceholderRendererComponent
 * @extends {BaseCellRendererComponent}
 */
@Component({
  selector: 'app-on-hover-placeholder-renderer',
  templateUrl: './on-hover-placeholder-renderer.component.html',
  styleUrls: ['./on-hover-placeholder-renderer.component.scss'],
})
export class OnHoverPlaceholderRendererComponent extends BaseCellRendererComponent {
  /**
   * Returns placeholder text
   *
   * @param {string} fieldValue - current field value
   * @returns {string}
   * @memberof OnHoverPlaceholderRendererComponent
   */
  getPlaceholder(fieldValue: string): string | undefined {
    if (fieldValue === undefined || fieldValue === null) {
      return undefined;
    }

    switch (this.params.colDef.field) {
      case 'bKScrubProductCode': {
        return BKScrubProductCodeEnumText[parseInt(fieldValue, 10)];
      }
      case 'bKScrubMatchCode': {
        const characters = fieldValue.split('');
        const enumValues = characters.map((char: string) => BKScrubMatchCodeEnum[char]).filter((value: string) => value !== undefined);
        return enumValues.join(', ');
      }
      default:
        return undefined;
    }
  }
}
