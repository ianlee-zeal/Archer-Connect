import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'enumToArrayPipe' })
export class EnumToArrayPipe implements PipeTransform {
  transform(value): { id: number, name: string }[] {
    return Object.keys(value)
      .filter(e => !Number.isNaN(+e))
      .map(i => ({ id: +i, name: value[i] }));
  }

  transformForStringKeys(value): { id: number, name: string }[] {
    return Object.keys(value)
      .filter(e => Number.isNaN(Number(e)))
      .map(i => ({ id: +value[i], name: i }));
  }

  /**
   * @param enumValue - enum of the form { prop1 = 42, prop2 = 43 }
   * @returns array of keys, eg ['prop1', 'prop2']
   */
  public transformToKeysArray(enumValue: any): string[] {
    return Object
      .keys(enumValue)
      .filter(key => Number.isNaN(+key));
  }
}
