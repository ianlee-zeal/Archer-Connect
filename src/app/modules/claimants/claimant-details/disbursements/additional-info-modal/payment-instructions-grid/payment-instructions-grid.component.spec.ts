import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInstructionsGridComponent } from './payment-instructions-grid.component';

describe('PaymentInstructionsGridComponent', () => {
  let component: PaymentInstructionsGridComponent;
  let fixture: ComponentFixture<PaymentInstructionsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentInstructionsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentInstructionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
