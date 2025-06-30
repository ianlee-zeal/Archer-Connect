import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountAuditLogsComponent } from './bank-account-audit-logs.component';

describe('BankAccountAuditLogsComponent', () => {
  let component: BankAccountAuditLogsComponent;
  let fixture: ComponentFixture<BankAccountAuditLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountAuditLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountAuditLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
