/**
 * Represents a key value pair.
 *
 * @export
 * @class KeyValuePair
 * @template TKey - the key type.
 * @template TValue - the value type.
 */
export class KeyValuePair<TKey, TValue> {

  /**
   * Gets this item's key.
   *
   * @memberof KeyValuePair
   */
  readonly key: TKey;

  /**
   * Gets this item's value.
   *
   * @memberof KeyValuePair
   */
  readonly value: TValue;

  /**
   * Initializes a new instance of KeyValuePair with the key and value.
   *
   * @param {TKey} key - the item's key.
   * @param {TValue} value - the item's value.
   *
   * @memberof KeyValuePair
   */
  constructor(key: TKey, value: TValue) {
    this.key = key;
    this.value = value;
  }

}
