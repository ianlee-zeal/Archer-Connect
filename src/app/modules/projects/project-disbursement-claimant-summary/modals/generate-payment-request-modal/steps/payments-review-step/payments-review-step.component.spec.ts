import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsReviewStepComponent } from './payments-review-step.component';

describe('PaymentsReviewStepComponent', () => {
  let component: PaymentsReviewStepComponent;
  let fixture: ComponentFixture<PaymentsReviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentsReviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsReviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
