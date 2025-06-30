import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountGeneralTabComponent } from './bank-account-general-tab.component';

describe('BankAccountGeneralTabComponent', () => {
  let component: BankAccountGeneralTabComponent;
  let fixture: ComponentFixture<BankAccountGeneralTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountGeneralTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
