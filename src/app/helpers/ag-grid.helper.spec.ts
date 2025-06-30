import { AGGridHelper } from './ag-grid.helper';

const DATE_1 = new Date(2020, 2, 12);
const DATE_2 = new Date(2020, 3, 14);
const DATE_3 = new Date(2020, 3, 14);

describe('AGGridHelperCompare', () => {
  it('Comparing a and a should return 0', () => {
    const result = AGGridHelper.compare('a', 'a');
    expect(result).toBe(0);
  });

  it('Comparing a and b should return -1', () => {
    const result = AGGridHelper.compare('a', 'b');
    expect(result).toBe(-1);
  });

  it('Comparing b and a should return 1', () => {
    const result = AGGridHelper.compare('b', 'a');
    expect(result).toBe(1);
  });

  it('Comparing a and null should return 1', () => {
    const result = AGGridHelper.compare('a', null);
    expect(result).toBe(1);
  });

  it('Comparing a and undefined should return 1', () => {
    const result = AGGridHelper.compare('a', undefined);
    expect(result).toBe(1);
  });

  it('Comparing a and " " should return 1', () => {
    const result = AGGridHelper.compare('a', ' ');
    expect(result).toBe(1);
  });

  it('Comparing houston and Houston should return -1', () => {
    const result = AGGridHelper.compare('houston', 'Houston');
    expect(result).toBe(-1);
  });

  it('Comparing Houston and houston should return 1', () => {
    const result = AGGridHelper.compare('Houston', 'houston');
    expect(result).toBe(1);
  });

  it('Comparing 1 and 1 should return 1', () => {
    const result = AGGridHelper.compare(1, 1);
    expect(result).toBe(0);
  });

  it('Comparing 1 and 2 should return -1', () => {
    const result = AGGridHelper.compare(1, 2);
    expect(result).toBe(-1);
  });

  it('Comparing 2 and 1 should return 1', () => {
    const result = AGGridHelper.compare(2, 1);
    expect(result).toBe(1);
  });

  it('Comparing true and true should return 0', () => {
    const result = AGGridHelper.compare(true, true);
    expect(result).toBe(0);
  });

  it('Comparing false and true should return -1', () => {
    const result = AGGridHelper.compare(false, true);
    expect(result).toBe(-1);
  });

  it('Comparing true and false should return 1', () => {
    const result = AGGridHelper.compare(true, false);
    expect(result).toBe(1);
  });

  it('Comparing 2020, 3, 14 and 2020, 3, 14 should return 0', () => {
    const result = AGGridHelper.compare(DATE_3, DATE_3);
    expect(result).toBe(0);
  });

  it('Comparing 2020, 2, 12 and 2020, 3, 14 should be less then -1', () => {
    const result = AGGridHelper.compare(DATE_1, DATE_2);
    expect(result).toBeLessThan(-1);
  });

  it('Comparing 2020, 3, 14 and 2020, 2, 12 should be more then 1', () => {
    const result = AGGridHelper.compare(DATE_2, DATE_1);
    expect(result).toBeGreaterThan(1);
  });

  it('Comparing 2020, 3, 14 and null should be more then 1', () => {
    const result = AGGridHelper.compare(DATE_2, null);
    expect(result).toBeGreaterThan(1);
  });

  it('Comparing 2020, 3, 14 and undefined should be more then 1', () => {
    const result = AGGridHelper.compare(DATE_2, undefined);
    expect(result).toBeGreaterThan(1);
  });

  it('Comparing 2020, 3, 14 and " " should be more then 1', () => {
    const result = AGGridHelper.compare(DATE_2, ' ');
    expect(result).toBeGreaterThan(1);
  });
});
