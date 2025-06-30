import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTypesConfigStepComponent } from './payment-types-config-step.component';

describe('PaymentTypesConfigStepComponent', () => {
  let component: PaymentTypesConfigStepComponent;
  let fixture: ComponentFixture<PaymentTypesConfigStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTypesConfigStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTypesConfigStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
