export class BankAccountType {
    id: number;
    name: string;

    constructor(model?: Partial<BankAccountType>) {
        Object.assign(this, model);
    }

    public static toModel(item: any): BankAccountType {
        return {
            id: item.id,
            name: item.name,
        };
    }
}
