export class Hidable {
  public static hideNumber(inputNumber: string, fieldLength: number = 9): string | null {
    if (!inputNumber) {
      return null;
    }

    const { length } = inputNumber;
    let hiddenNumber = inputNumber;

    if (fieldLength > 4) {
      hiddenNumber = '*'.repeat(fieldLength - 4) + inputNumber.substring(length - 4, length);
    }

    return hiddenNumber;
  }
}
