import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualPaymentRequestComponent } from './manual-payment-request.component';

describe('ManualPaymentRequestComponent', () => {
  let component: ManualPaymentRequestComponent;
  let fixture: ComponentFixture<ManualPaymentRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualPaymentRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualPaymentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
