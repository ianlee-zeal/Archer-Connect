export class PercentageHelper {
  public static toFractionPercentage(value: number, fractionDigits: number = 2, addPercentageSign: boolean = true): string {
    // TODO regex solution might look more elegant
    const str = this.truncate(+value, fractionDigits).toString();
    const dotIdx = str.indexOf('.');

    const leftDigits = dotIdx != -1 ? str.substr(0, dotIdx) : str;
    const rightDigits = dotIdx != -1 ? str.substr(dotIdx + 1).padEnd(2, '0') : '00';

    const result = `${leftDigits}.${rightDigits}${addPercentageSign ? '%' : ''}`;

    return result;
  }

  public static truncate(amount: number, fractionDigits: number = 2): number {
    const decimalPlaces = 10 ** fractionDigits;
    return Math.trunc(+(amount * decimalPlaces).toPrecision(15)) / decimalPlaces;
  }
}
