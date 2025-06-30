import { by, element } from 'protractor';

export class CommonPO {
    getModalDialogHeaderText() {
        return element(by.css('.modal-header'));
    }
}