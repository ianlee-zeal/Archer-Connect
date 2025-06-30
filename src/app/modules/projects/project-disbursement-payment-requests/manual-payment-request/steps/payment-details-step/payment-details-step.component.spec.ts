import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDetailsStepComponent } from './payment-details-step.component';

describe('PaymentDetailsStepComponent', () => {
  let component: PaymentDetailsStepComponent;
  let fixture: ComponentFixture<PaymentDetailsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentDetailsStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
