/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-restricted-globals */

export class CommonHelper {
  private static nextId = -1;

  // this is try to implement nameof operator from C#
  public static nameOf(obj: object): string {
    const keys = Object.keys(obj);

    if (keys.length !== 1) {
      throw new Error('Object should contain only one property');
    }

    return keys.pop();
  }

  public static equals(object1: object, object2: object): boolean {
    if (object1 === object2) {
      return true;
    }

    const props1 = Object.getOwnPropertyNames(object1);
    const props2 = Object.getOwnPropertyNames(object2);

    if (props1.length !== props2.length) {
      return false;
    }

    for (let i = 0; i < props1.length; i++) {
      const propName = props1[i];

      if (object1[propName] !== object2[propName]) {
        return false;
      }
    }

    return true;
  }

  // Checks if string blank: "" or " " or "    " etc.
  public static isBlank(str: string) {
    return (!str || /^\s*$/.test(str));
  }

  public static getElementStyle(element: HTMLElement, style: string): string | number {
    const propertyValue = window.getComputedStyle(element, null)[style];
    const numberValue = parseInt(propertyValue, 10);

    return !isNaN(numberValue) ? numberValue : propertyValue;
  }

  public static setShortBooleanProperty(value: any): boolean {
    return !!value || value === '';
  }

  // It can be used as a second params of memoize function to customize cache key https://lodash.com/docs/4.17.15#memoize
  public static multipleParamsMemoizationResolver(...args): string {
    return args.map(arg => (Array.isArray(arg)
      ? arg.join('_')
      : (arg || '').toString())).join('_');
  }

  static getPercentageValue(value: number, decimalParts = 1): string {
    return (value || 0).toFixed(decimalParts);
  }

  static toPercentage(value: string, decimalParts = 2): string {
    return (parseFloat(value || '0') / 100).toFixed(decimalParts);
  }

  static toPercentageNumber(value: string, decimalParts = 2): number {
    return parseFloat((parseFloat(value || '0') / 100).toFixed(decimalParts));
  }

  static fromPercentage(value: number, decimalParts = 2): string {
    return (value * 100).toFixed(decimalParts);
  }

  static isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
  }

  static createEntityUniqueId(): number {
    return this.nextId--;
  }

  static addDays(date: Date, days: number) {
    date.setDate(date.getDate() + days);
    return date;
  }

  /**
   * Console log even in prod mode
   * To enable logger type in browser's console type <log = console.debug> or <log = console.log>
  */
  public static windowLog(message: any, ...params: any[]): void {
    const log = window['log'];

    if (log == null) {
      return;
    }

    if (params) {
      log(message, ...params);
    } else {
      log(message);
    }
  }

  public static isValidInt32(value: string): boolean {
    return !Number.isNaN(+value)
      && (+value > -2147483648)
      && (+value < 2147483647);
  }

  public static getDeepCopy<T>(data: object): T {
    return JSON.parse(JSON.stringify(data));
  }
}
