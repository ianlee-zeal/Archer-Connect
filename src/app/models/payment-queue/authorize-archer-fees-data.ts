export class AuthorizeArcherFeesData {
  clientId: number;
  ledgerEntryId: number;
  summary: string;

  constructor(model?: AuthorizeArcherFeesData) {
    Object.assign(this, model);
  }

  public static toModel(item: any): AuthorizeArcherFeesData {
    return {
      clientId: item.clientId,
      ledgerEntryId: item.ledgerEntryId,
      summary: item.summary
    };
  }
}
