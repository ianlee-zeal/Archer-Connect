import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountsCreateComponent } from './bank-accounts-create.component';

describe('BankAccountsCreateComponent', () => {
  let component: BankAccountsCreateComponent;
  let fixture: ComponentFixture<BankAccountsCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountsCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
