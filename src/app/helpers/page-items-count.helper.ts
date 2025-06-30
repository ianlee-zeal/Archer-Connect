import memoize from 'lodash.memoize';
import { ArrayHelper } from './array.helper';
import { SelectHelper } from './select.helper';

export class PageItemsCountHelper {
  public static getCountPageItems = memoize((pageCount: number) => SelectHelper.toOptions(
    ArrayHelper.range(1, 4).map(x => x * pageCount),
    option => option,
    option => option.toString(),
  ));

  public static isCountPageValue(value: number, pagesCount: number) {
    return this.getCountPageItems(pagesCount).some(item => Number(item.name) === value);
  }
}
