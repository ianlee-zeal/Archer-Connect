export class Hold {
  clientId: number;
  holdTypeReasonId: number;
  followUpDate: Date;
  description: string;

  constructor(model?: Hold) {
    Object.assign(this, model);
  }
}
