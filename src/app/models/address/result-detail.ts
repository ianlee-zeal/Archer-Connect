export class ResultDetail {
    resultDetail: string;
    shortDescription: string;

    constructor(model?: ResultDetail) {
        Object.assign(this, model);
    }
}