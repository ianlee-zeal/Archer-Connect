export class ClientLiens {
  id: number;
  firstName: string;
  lastName: string;
  ssn: string;
  dob: Date
  firmId: number;
  firmName: string;

  totalLiens: number;
  finalizedLiens: number;

  clientFinalizedStatusId:number;
  clientFinalizedStatus:string;

  productId:number;
  product:string;

  constructor(model?: Partial<ClientLiens>) {
    Object.assign(this, model);
  }
}
