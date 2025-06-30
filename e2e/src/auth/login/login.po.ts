import { browser, by, element } from 'protractor';

export class LoginPage {
    private get userNameInput() {
        return element(by.id("username"));
    }

    private get passwordInput() {
        return element(by.id("password"));
    }

    navigateTo() {
        return browser.get("/login");
    }

    getTitleText() {
        return element(by.css('h4')).getText();
    }

    getUserName() {
        return this.userNameInput.getAttribute('value');
    }

    setUserName(userName: string) {
        return this.userNameInput.sendKeys(userName);
    }

    getPassword() {
        return this.passwordInput.getAttribute('value');
    }

    setPassword(password: string) {
        return this.passwordInput.sendKeys(password);
    }

    getSubmitButton() {
        return element(by.css('button[type = submit]'));
    }

    getForgotPasswordLink() {
        return element(by.css('.reset-link a'));
    }
}
