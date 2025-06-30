export class ClaimantOverviewDto<T> {
  name: string;
  status: { id: number; name: string };
  extra?: any;
  data: T[];

  static empty<T>(): ClaimantOverviewDto<T> {
    return null;
  }
}
