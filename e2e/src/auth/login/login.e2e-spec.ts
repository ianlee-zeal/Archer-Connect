import { browser } from 'protractor';

import { LoginPage } from './login.po';
import { CommonPO } from '../../common.po';
import { Helper } from '../../helper';

describe("Positive test cases for 'Login' page", () => {
    let page: LoginPage;

    beforeAll(() => {
        page = new LoginPage();
        page.navigateTo();
    });

    afterEach(async () => {
        await Helper.checkLogs();
    });

    it("should display sign into title", () => {
        expect(page
            .getTitleText())
            .toEqual("Sign into ARCHER Connect ®");
    });

    it("should navigate to 'Forgot Password' page on click 'Forgot Password' link", () => {
        page.getForgotPasswordLink()
            .click()
            .then(() => {
                expect(browser.getCurrentUrl())
                    .toContain("login/forgot-password");
            })
            .then(() => {
                browser.navigate().back();
            });
    });

    it("should fill user name", () => {
        page.setUserName(Helper.user.email);
        expect(page.getUserName()).toEqual(Helper.user.email);
    });

    it("should fill password", () => {
        page.setPassword(Helper.user.password);
        expect(page.getPassword()).toEqual(Helper.user.password);
    });

    xit("should click Login button", () => {
        page.getSubmitButton()
            .click()
            .then(() => {
                expect(browser.getCurrentUrl())
                    .toContain("TODO implement");
            });
    });
});

describe("Negative test cases for 'Login' page", () => {
    let page: LoginPage;
    const commonPO = new CommonPO();

    beforeAll(() => {
        page = new LoginPage();
        page.navigateTo();
    });

    afterEach(async () => {
        await Helper.checkLogs();
    });

    xit("should show an modal error dialog for wrong credentials on click 'Login' button", () => {
        page.setUserName("wrong_user");
        page.setPassword("wrong_password");

        page.getSubmitButton()
            .click()
            .then(() => {
                expect(commonPO.getModalDialogHeaderText())
                    .toContain("TODO implement");
            });
    });
});