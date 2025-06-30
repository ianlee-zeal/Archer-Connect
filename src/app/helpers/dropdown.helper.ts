export class DropdownHelper {
  public static compareOptions(option1, option2): boolean {
    return option1 && option2 ? option1.id === option2.id : false;
  }
}
