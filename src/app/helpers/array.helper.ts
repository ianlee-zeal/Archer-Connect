/* eslint-disable no-param-reassign */
import { AbstractEntity, IdValue } from '../models';
import { HashTable } from '../models/hash-table';

export class ArrayHelper {
  public static areArraysEqual(array: any[], otherArray: any[]): boolean {
    if (!array || !otherArray) {
      return false;
    }

    if (array === otherArray) {
      return true;
    }

    if (array.length !== otherArray.length) {
      return false;
    }

    return array.every((item, index) => item === otherArray[index]);
  }

  public static range(start: number, end: number): number[] {
    if (end < start) {
      throw new Error('Invalid parameters: end < start');
    }

    const result = [];

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  }

  /**
  * items - source collection of T objects
  * criteria - property name of T object used to group by
  * criteriaFieldIdGetter - function which can be used to get identity of object which is used for grouping (see example below)
  *
  * const items = [ { id: 1, name: 'obj 1', status: { id: 1, name: 'Pending' } }, { id: 2, name: 'obj 2', status: { id: 1, name: 'Pending' } }, { id: 3, name: 'obj 3', status: { id: 2, name: 'Finalized'} }];
  * ArrayHelper.groupBy(items, 'status', (obj) => obj.id);
  *
  */
  public static groupBy<T>(items: T[], criteria: string, criteriaFieldIdGetter: (object: Object) => string | number): HashTable<T[]> {
    return items.reduce((obj: HashTable<T[]>, item: T) => {
      let key = item[criteria];

      if (key instanceof Object) {
        key = criteriaFieldIdGetter(key);
      }

      if (!obj.hasOwnProperty(key)) {
        obj[key] = [];
      }

      obj[key].push(item);

      return obj;
    }, {});
  }

  public static uniq(array: (string | number)[]): (string | number)[] {
    const hashTable = {} as HashTable<string | number>;

    array.forEach(item => { hashTable[item.toString()] = item; });

    return Object.keys(hashTable).map(key => hashTable[key]);
  }

  public static uniqEntities<T extends AbstractEntity>(array: T[]): T[] {
    return array.filter(
      (item, index, source) => source.findIndex(sourceItem => sourceItem.id === item.id) === index,
    );
  }

  public static removeAtIndex(data: any[], index: number): any[] {
    if (!data || data.length === 0 || index < 0 || index >= data.length) {
      return data;
    }
    return [
      ...data.slice(0, index),
      ...data.slice(index + 1),
    ];
  }

  public static empty(arr: any[]): void {
    if (arr && arr.length) {
      arr.splice(0, arr.length);
    }
  }

  public static add(data: any[], item: any, ifNotExists = false): any[] {
    if (!data) {
      return [item];
    } if (ifNotExists && data.indexOf(item) >= 0) {
      return data;
    }
    return data.concat(item);
  }

  public static insertAt(data: any[], index: number, item: any): any[] {
    if (!data || data.length === 0) {
      return [item];
    } if (index < 0) {
      index = 0;
    } else if (index >= data.length) {
      return ArrayHelper.add(data, item);
    }

    return [
      ...data.slice(0, index),
      item,
      ...data.slice(index),
    ];
  }

  public static findIdValueNameInArray(options: IdValue[], valueA: number[], valueB: number[], indexA = 0, indexB = 0): [string, string] {
    if (indexA < valueA.length && indexB < valueB.length) {
      if (valueA[indexA] === valueB[indexB]) {
        return ArrayHelper.findIdValueNameInArray(options, valueA, valueB, indexA + 1, indexB + 1);
      }
      const aMissingDoc: IdValue = options.find((i: IdValue) => i.id === valueA[indexA]);
      const bMissingDoc: IdValue = options.find((i: IdValue) => i.id === valueB[indexB]);
      return [
        aMissingDoc ? aMissingDoc.name : '',
        bMissingDoc ? bMissingDoc.name : '',
      ];
    }
    return ['', ''];
  }

  public static isArray(value: any): boolean {
    return value instanceof Array;
  }
}
