import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountPaymentsHistoryComponent } from './bank-account-payments-history.component';

describe('BankAccountPaymentsHistoryComponent', () => {
  let component: BankAccountPaymentsHistoryComponent;
  let fixture: ComponentFixture<BankAccountPaymentsHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountPaymentsHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountPaymentsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
