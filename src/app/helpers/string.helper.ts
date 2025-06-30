import { JobNameEnum } from '@app/models/enums';
import { v4 as uuid } from 'uuid';
import { CommonHelper } from './common.helper';

export class StringHelper {
  public static isString(x): boolean {
    return typeof x === 'string';
  }

  public static isEmpty(str: string): boolean {
    if (!str) {
      return true;
    }

    return !(StringHelper.isString(str) && !!str.trim());
  }

  public static capitalize(str: string): string {
    if (!StringHelper.isString(str)) {
      return '';
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public static reverse(str: string): string {
    if (str == null) { // we have to check here for null and undefined
      return str;
    }

    return str.split('').reverse().join('');
  }

  public static containsComma(str: string): boolean {
    return (`${str}`).indexOf(',') !== -1;
  }

  public static serialize(object: any, prefix?: string): string[] {
    const params: string[] = [];

    Object.keys(object)
      .filter((propName: string) => !!object[propName])
      .forEach((propName: string) => {
        const key = prefix ? prefix[propName] : propName;
        const value = object[key];

        if (Array.isArray(value)) {
          value.forEach(item => {
            const param = item instanceof Object ? JSON.stringify(item) : item;

            params.push(this.encodeQueryParams(key, param));
          });
        } else if (value instanceof Object) {
          params.push(this.encodeQueryParams(key, JSON.stringify(value)));
        } else {
          params.push(this.encodeQueryParams(key, value));
        }
      });

    return params;
  }

  public static queryString(search: any): string {
    if (!search) {
      return '';
    }

    const queryParamsString = this.serialize(search).join('&');

    return queryParamsString ? `?${queryParamsString}` : '';
  }

  public static stripDashes(str: string): string {
    return str?.replace(/\-/gi, '');
  }

  public static contains(source: string, value: string): boolean {
    return source.toLowerCase().includes(value.toLowerCase());
  }

  /**
   * Checks if provided string values are equal
   *
   * @static
   * @param {string} value1 - first string value for comparing
   * @param {string} value2 - second string value for comparing
   * @returns {boolean}
   * @memberof StringHelper
   */
  static equal(value1: string, value2: string): boolean {
    return (value1 || '').toUpperCase() === (value2 || '').toUpperCase();
  }

  private static encodeQueryParams(key: string, value: string): string {
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }

  static generateChannelName(jobName: JobNameEnum, entityId: number = null, entityType: number = null): string {
    if (CommonHelper.isNullOrUndefined(entityId) && CommonHelper.isNullOrUndefined(entityType)) {
      return `${jobName}_${uuid()}`;
    }
    return `${jobName}_${entityType}_${entityId}_${uuid()}`;
  }

  public static toValueOrNull(str: string): string {
    if (str === null || str === undefined) {
      return null;
    }

    const trimmed = str.trim();

    if (!trimmed.length) {
      return null;
    }

    return trimmed;
  }

  public static parseInt(str: string, defaultIfNaN: number = null): number {
    return Number.isNaN(Number.parseInt(str, 10))
      ? defaultIfNaN
      : Number.parseInt(str, 10);
  }

  public static parseFloat(str: string, defaultIfNaN: number = null): number {
    return Number.isNaN(Number.parseFloat(str))
      ? defaultIfNaN
      : Number.parseFloat(str);
  }

  public static isIntegerString(value: string): boolean {
    return parseInt(value, 10) === +value;
  }

  public static isFloatString(value: string): boolean {
    return parseFloat(value) === +value;
  }

  public static isNumericString(value: string): boolean {
    return this.isIntegerString(value) || this.isFloatString(value);
  }

  // Truncate number string if it exceed max lenght
  public static truncateNumber(number, maxLength): string {
    if (number === null || number === undefined) {
      return '';
    }

    const numberString = number.toLocaleString();

    if (numberString.length > maxLength) {
      return `${numberString.slice(0, maxLength - 3)}...`;
    }
    return `${numberString}`;
  }

  public static buildIdName(id: number | string, name: string): string {
    return id && name ? `(${id}) ${name}` : '';
  }
}
