/* eslint-disable @typescript-eslint/no-use-before-define */
import { KeyValue } from '@angular/common';
import { KeyValuePair } from './key-value-pair';

/**
 * Defines the dictionary interface for storing key-value pairs.
 *
 * @export
 * @interface IDictionary
 * @template TKey - the key type, either string or number.
 * @template TValue - the value type.
 */
export interface IDictionary<TKey extends string | number, TValue> {

  /**
   * When implemented by a class, adds or updates a value by key.
   *
   * @param {TKey} key - the key of value to add or update.
   * @param {TValue} value - the new value.
   *
   * @memberof IDictionary
   */
  setValue(key: TKey, value: TValue): void;

  /**
   * When implemented by a class, removes a value from this
   * dictionary by key.
   *
   * @param {TKey} key - the key of value to remove.
   *
   * @memberof IDictionary
   */
  remove(key: TKey): void;

  /**
   * When implemented by a class, gets a value by key.
   *
   * @param {TKey} key - the key of value to retrieve.
   * @returns {TValue} - the value matching the specified key if exists or null.
   *
   * @memberof IDictionary
   */
  getValue(key: TKey): TValue;

  /**
   * When implemented by a class, gets {KeyValuePair<TKey, TValue>} item by key.
   *
   * @param {TKey} key
   * @returns {KeyValuePair<TKey, TValue>}
   *
   * @memberof IDictionary
   */
  getItem(key: TKey): KeyValuePair<TKey, TValue>;

  /**
   * When implemented by a class, checks whether the specified key
   * exists in this dictionary.
   *
   * @param {TKey} key - the key to check.
   * @returns {boolean} - true if key exists, false otherwise.
   *
   * @memberof IDictionary
   */
  containsKey(key: TKey): boolean;

  /**
   * When implemented by a class, returns a shallow copy of this
   * dictionary.
   *
   * @returns {IDictionary<TKey, TValue>}
   *
   * @memberof IDictionary
   */
  clone(): IDictionary<TKey, TValue>;

  /**
   * When implemented by a class, gets the number of items
   * in this dictionary.
   *
   * @type {number}
   * @memberof IDictionary
   */
  count(): number;

  /**
   * When implemented by a class, gets the flag that indicates whether
   * this dictionary is readonly or not.
   *
   * @type {boolean}
   * @memberof IDictionary
   */
  isReadOnly(): boolean;

  /**
   * When implemented by a class, gets the collection of all keys
   * in this dictionary.
   *
   * @type {TKey[]}
   * @memberof IDictionary
   */
  keys(): TKey[];

  /**
   * When implemented by a class, gets the collection of all values
   * stored in this dictionary.
   *
   * @type {TValue[]}
   * @memberof IDictionary
   */
  values(): TValue[];

  /**
   * When implemented by a class, gets the collection of
   * {KeyValuePair<TKey, TValue>} stored in this dictionary.
   *
   * @type {KeyValuePair<TKey, TValue>[]}
   * @memberof IDictionary
   */
  items(): KeyValuePair<TKey, TValue>[];

  /**
   * When implemented by a class, clears this dictionary.
   */
  clear();

  /**
   * When implemented by a class, appends items from another dictionary to this one.
   * Only items that do not yet exist in this dictionary will be appended.
   */
  append(other: IDictionary<TKey, TValue>);
}

/**
 * The default {IDictionary<TKey, TValue>} implementation.
 *
 * @export
 * @class Dictionary
 * @implements {IDictionary<TKey, TValue>}
 * @implements {ISchemaTypeObject}
 * @template TKey
 * @template TValue
 */
export class Dictionary<TKey extends string | number, TValue>
implements IDictionary<TKey, TValue> {
  /** @inheritdoc */
  __type: string;

  /** The dictionary map for storing key-value pairs */
  protected _items: { [key: string]: KeyValue<TKey, TValue> } = {};

  /** The counter that keeps track of total number of items in this dictionary. */
  protected _count = 0;

  /**
   * Initializes a new instance of {Dictionary<TKey, TValue>}.
   *
   *  @param {KeyValuePair<TKey, TValue>[]} items - the optional collection of items to initialize with.
   *
   */
  constructor(items?: KeyValuePair<TKey, TValue>[]) {
    if (items) {
      items.forEach(i => this._items[<string>i.key] = i);
      this._count = items.length;
    }
  }

  /** @inheritdoc */
  containsKey(key: TKey): boolean {
    return this._items.hasOwnProperty(key);
  }

  /** @inheritdoc */
  setValue(key: TKey, value: TValue): void {
    if (this.isReadOnly()) {
      throw new Error('setValue() operation is not supported by this instance of the dictionary.');
    }

    const exists = this.containsKey(key);

    this._items[<string>key] = new KeyValuePair<TKey, TValue>(key, value);

    if (!exists) {
      this._count++;
    }
  }

  /** @inheritdoc */
  getValue(key: TKey): TValue {
    return this.containsKey(key) ? this._items[<string>key].value : null;
  }

  /** @inheritdoc */
  getItem(key: TKey): KeyValuePair<TKey, TValue> {
    return this.containsKey(key) ? this._items[<string>key] : null;
  }

  /** @inheritdoc */
  remove(key: TKey): void {
    if (this.isReadOnly()) {
      throw new Error('remove() operation is not supported by this instance of the dictionary.');
    }

    if (this.containsKey(key)) {
      delete this._items[<string>key];
      this._count--;
    }
  }

  /** @inheritdoc */
  isReadOnly(): boolean {
    return false;
  }

  /** @inheritdoc */
  count(): number {
    return this._count;
  }

  /** @inheritdoc */
  items(): KeyValuePair<TKey, TValue>[] {
    return Object.keys(this._items)
      .map(key => this._items[key]);
  }

  /** @inheritdoc */
  keys(): TKey[] {
    return this.items().map(item => item.key);
  }

  /** @inheritdoc */
  values(): TValue[] {
    return this.items().map(item => item.value);
  }

  /** @inheritdoc */
  clone() {
    return new Dictionary<TKey, TValue>([...this.items()]);
  }

  /**
   * Returns a read-only representation of this dictionary.
   *
   * @memberof Dictionary
   */
  asReadOnly() {
    return new ReadOnlyDictionary<TKey, TValue>(this.items());
  }

  /** @inheritdoc */
  clear() {
    if (this.isReadOnly()) {
      throw new Error('clear() operation is not supported by this instance of the dictionary.');
    }

    this._items = {};
    this._count = 0;
  }

  /**
   * @inheritdoc
   */
  append(other: IDictionary<TKey, TValue>) {
    if (this.isReadOnly()) {
      throw new Error('merge() operation is not supported by this instance of the dictionary.');
    }

    if (!other) {
      return;
    }

    other.items().forEach(item => {
      if (!this.containsKey(item.key)) {
        this.setValue(item.key, item.value);
      }
    });
  }
}

/**
 * A readonly {IDictionary<TKey, TValue>} implementation.
 *
 * @export
 * @class ReadOnlyDictionary
 * @extends {Dictionary<TKey, TValue>}
 * @template TKey
 * @template TValue
 */
export class ReadOnlyDictionary<TKey extends number | string, TValue>
  extends Dictionary<TKey, TValue> {
  /**
   * Initializes a new instance of {Dictionary<TKey, TValue>}.
   *
   *  @param {KeyValuePair<TKey, TValue>[]} items - the collection of items to initialize with.
   *
   */
  constructor(items?: KeyValuePair<TKey, TValue>[]) {
    super(items);
  }

  /** @inheritdoc */
  isReadOnly(): boolean {
    return true;
  }

  /** @inheritdoc */
  clone() {
    return new ReadOnlyDictionary<TKey, TValue>([...this.items()]);
  }
}
