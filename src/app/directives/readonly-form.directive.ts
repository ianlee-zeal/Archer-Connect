import { Directive, ElementRef, Input } from '@angular/core';

/**
 * When placed on HTML container element such as form or div, prevents users from
 * changing values of inner input controls by setting their readonly attributes if
 * readonly property is true. Controls that do not support readonly attribute will be
 * disabled.
 *
 * @export
 * @class ReadOnlyFormDirective
 */
@Directive({ selector: '[readonlyForm]' })
export class ReadOnlyFormDirective {
  private readOnlyInternal = false;

  /**
   * Creates an instance of ReadOnlyFormDirective.
   *
   * @param {ElementRef} elementRef - the reference to the native DOM container element
   * that represents an HTML form.
   *
   * @memberof ReadOnlyFormDirective
   */
  constructor(private readonly elementRef: ElementRef) {}

  /**
   * Gets the flag that indicates whether the HTML form on which this directive is placed
   * is readonly.
   *
   * @readonly
   * @type {boolean}
   * @memberof ReadOnlyFormDirective
   */
  get readOnly(): boolean {
    return this.readOnlyInternal;
  }

  /**
   * Sets the flag that toggles HTML form from read-only to editable.
   *
   * @memberof ReadOnlyFormDirective
   */
  @Input('readonlyForm')
  set readOnly(value: boolean) {
    if (this.readOnlyInternal !== value) {
      this.readOnlyInternal = value;
      this.toggleFormState();
    }
  }

  /**
   * Toggles HTML form's state from readonly to editable and vice versa.
   *
   * @private
   *
   * @memberof ReadOnlyFormDirective
   */
  private toggleFormState() {
    const inputs = this.elementRef.nativeElement.getElementsByTagName('input');
    const textAreas = this.elementRef.nativeElement.getElementsByTagName('textarea');
    const buttons = this.elementRef.nativeElement.getElementsByTagName('button');
    const selects = this.elementRef.nativeElement.getElementsByTagName('select');

    const elements = Array.prototype.slice.call(inputs).concat(
      Array.prototype.slice.call(textAreas),
    ).concat(
      Array.prototype.slice.call(buttons),
    ).concat(
      Array.prototype.slice.call(selects),
    );

    elements.forEach(element => {
      if (this.supportsReadonly(element)) {
        if (this.readOnlyInternal) {
          element.setAttribute('readonly', 'readonly');
        } else {
          element.removeAttribute('readonly');
        }
      } else if (this.readOnlyInternal) {
        element.setAttribute('disabled', 'disabled');
      } else {
        element.removeAttribute('disabled');
      }
    });
  }

  /**
   * Checks whether the specified DOM element supports readonly mode.
   *
   * @private
   * @param {*} element - the element to check.
   * @returns {boolean} - true if element can be readonly, otherwise false.
   *
   * @memberof ReadOnlyFormDirective
   */
  private supportsReadonly(element: HTMLInputElement): boolean {
    return element.type !== 'hidden'
      && element.type !== 'range'
      && element.type !== 'color'
      && element.type !== 'checkbox'
      && element.type !== 'radio'
      && element.type !== 'file'
      && element.type !== 'button'
      && element.type !== 'submit'
      && !element.type.startsWith('select');
  }
}
