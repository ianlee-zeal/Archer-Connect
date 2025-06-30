import { browser, by, element } from 'protractor';

export class ForgotPasswordPage {
    private get emailInput() {
        return element(by.id("email"));
    }

    navigateTo() {
        return browser.get("login/forgot-password");
    }

    getTitleText() {
        return element(by.css('h5')).getText();
    }

    getEmail() {
        return this.emailInput.getAttribute('value');
    }

    setEmail(email: string) {
        return this.emailInput.sendKeys(email);
    }

    getSubmitButton() {
        return element(by.css('button[type = submit]'));
    }
}
